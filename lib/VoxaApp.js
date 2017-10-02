'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const debug = require('debug')('voxa');
const VoxaReply = require('./VoxaReply');
const UnknownRequestType = require('./Errors').UnkownRequestType;
const capitalize = require('capitalize');

class VoxaApp {
  constructor(config) {
    this.config = config;
    this.eventHandlers = {};
    this.requestHandlers = {
      SessionEndedRequest: this.handleOnSessionEnded.bind(this),
    };

    _.forEach(this.requestTypes, requestType => this.registerRequestHandler(requestType));
    this.registerEvents();

    this.onSessionEnded(voxaEvent => (new VoxaReply(voxaEvent)), true);
    this.onError((voxaEvent, error) => {
      debug('onError %s', error);
      debug(error.stack);
      return new VoxaReply(voxaEvent, { tell: 'An unrecoverable error occurred.' });
    }, true);
  }

  /*
   * This way we can simply override the method if we want different request types
   */
  get requestTypes() { // eslint-disable-line class-methods-use-this
    return [
      'IntentRequest',
      'SessionEndedRequest',
      'AudioPlayer.PlaybackStarted',
      'AudioPlayer.PlaybackFinished',
      'AudioPlayer.PlaybackNearlyFinished',
      'AudioPlayer.PlaybackStopped',
      'AudioPlayer.PlaybackFailed',
      'System.ExceptionEncountered',
      'PlaybackController.NextCommandIssued',
      'PlaybackController.PauseCommandIssued',
      'PlaybackController.PlayCommandIssued',
      'PlaybackController.PreviousCommandIssued',
    ];
  }

  handleOnSessionEnded(voxaEvent, reply) {
    return Promise.mapSeries(this.getOnSessionEndedHandlers(), fn => fn(voxaEvent, reply))
      .then(_.last);
  }

  /*
   * iterate on all error handlers and simply return the first one that
   * generates a reply
   */
  handleErrors(voxaEvent, error) {
    return Promise.reduce(this.getOnErrorHandlers(), (reply, errorHandler) => {
      if (reply) {
        return reply;
      }
      return Promise.resolve(errorHandler(voxaEvent, error));
    }, null)
      .then((reply) => {
        reply.error = error;
        return reply;
      });
  }

  execute(voxaEvent) {
    debug('Received new event');
    debug(voxaEvent);
    return Promise.try(() => {
      const voxaReply = new VoxaReply(voxaEvent);
      // Validate that this AlexaRequest originated from authorized source.
      if (this.config.appIds) {
        const appId = voxaEvent.context.application.applicationId;

        if (_.isString(this.config.appIds) && this.config.appIds !== appId) {
          debug(`The applicationIds don't match: "${voxaEvent.context.application.applicationId}"  and  "${this.config.appIds}"`);
          throw new Error('Invalid applicationId');
        }

        if (_.isArray(this.config.appIds) && !_.includes(this.config.appIds, appId)) {
          debug(`The applicationIds don't match: "${voxaEvent.context.application.applicationId}"  and  "${this.config.appIds}"`);
          throw new Error('Invalid applicationId');
        }
      }

      if (!this.requestHandlers[voxaEvent.request.type]) {
        throw new UnknownRequestType(voxaEvent.request.type);
      }

      const requestHandler = this.requestHandlers[voxaEvent.request.type];

      switch (voxaEvent.request.type) {
        case 'IntentRequest':
        case 'SessionEndedRequest': {
          // call all onRequestStarted callbacks serially.
          return Promise.mapSeries(this.getOnRequestStartedHandlers(), fn => fn(voxaEvent, voxaReply))
            .then(() => {
              if (!voxaEvent.session.new) {
                return null;
              }
              // call all onSessionStarted callbacks serially.
              return Promise.mapSeries(this.getOnSessionStartedHandlers(),
                fn => fn(voxaEvent, voxaReply));
            })
          // Route the request to the proper handler which may have been overriden.
            .then(() => requestHandler(voxaEvent, voxaReply));
        }

        default: {
          return requestHandler(voxaEvent, voxaReply);
        }
      }
    })
      .catch(error => this.handleErrors(voxaEvent, error));
  }

  /*
   * Request handlers are in charge of responding to the different request types alexa sends,
   * in general they will defer to the proper event handler
   */
  registerRequestHandler(requestType) {
    // .filter(requestType => !this.requestHandlers[requestType])
    if (this.requestHandlers[requestType]) {
      return;
    }

    const eventName = `on${requestType}`;
    this.registerEvent(eventName);

    this.requestHandlers[requestType] = (voxaEvent, reply) => {
      debug(eventName);
      const capitalizedEventName = capitalize(eventName);
      return Promise.mapSeries(this[`get${capitalizedEventName}Handlers`](), fn => fn.call(this, voxaEvent, reply))
        .then(_.last);
    };
  }

  /*
   * Event handlers are array of callbacks that get executed when an event is triggered
   * they can return a promise if async execution is needed,
   * most are registered with the voxaEvent handlers
   * however there are some that don't map exactly to a voxaEvent and we register them in here,
   * override the method to add new events.
   */
  registerEvents() {
    // Called when the request starts.
    this.registerEvent('onRequestStarted');

    // Called when the session starts.
    this.registerEvent('onSessionStarted');

    // Called when the user ends the session.
    this.registerEvent('onSessionEnded');

    // Sent whenever there's an unhandled error in the onIntent code
    this.registerEvent('onError');
  }

  /*
   * Create an event handler register for the provided eventName
   * This will keep 2 separate lists of event callbacks
   */
  registerEvent(eventName) {
    this.eventHandlers[eventName] = [];
    this.eventHandlers[`_${eventName}`] = []; // we keep a separate list of event callbacks to alway execute them last
    if (!this[eventName]) {
      const capitalizedEventName = capitalize(eventName);

      this[eventName] = (callback, atLast) => {
        if (atLast) {
          this.eventHandlers[`_${eventName}`].push(callback.bind(this));
        } else {
          this.eventHandlers[eventName].push(callback.bind(this));
        }
      };

      this[`get${capitalizedEventName}Handlers`] = () => _.concat(this.eventHandlers[eventName], this.eventHandlers[`_${eventName}`]);
    }
  }
}

module.exports = VoxaApp;
