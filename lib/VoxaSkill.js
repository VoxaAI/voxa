'use strict';

const Promise = require('bluebird');
const ReplyFactory = require('./ReplyFactory.js');
const EventFactory = require('./EventFactory.js');
const _ = require('lodash');
const debug = require('debug')('voxa');
const UnknownRequestType = require('./Errors').UnkownRequestType;
const capitalize = require('capitalize');
const createServer = require('./create-server');

class VoxaSkill {
  constructor(config) {
    this.config = config;
    this.eventHandlers = {};
    this.requestHandlers = {
      SessionEndedRequest: this.handleOnSessionEnded.bind(this),
    };
    this.registerRequestHandlers();
    this.registerEvents();

    this.onSessionEnded(() => ({ version: '1.0' }), true);
    this.onError((voxaEvent, error) => {
      debug('onError %s', error);
      debug(error.stack);
      return ReplyFactory.makeReply(voxaEvent, { tell: 'An unrecoverable error occurred.' });
    }, true);
  }

  startServer(port) {
    port = port || 3000;
    createServer(this).listen(port, () => {
      debug(`Listening on port ${port}`);
    });
  }

  /*
   * This way we can simply override the method if we want different request types
   */
  get requestTypes() { // eslint-disable-line class-methods-use-this
    return [
      'LaunchRequest',
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

  lambda() {
    return (event, context, callback) => this.execute(event, context)
      .then(result => callback(null, result))
      .catch(callback);
  }

  execute(rawEvent) {
    debug('Received new event');
    const voxaEvent = EventFactory.makeEventObject(rawEvent);
    debug(voxaEvent);
    return Promise.try(() => {
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


      if (this.getOnLaunchRequestHandlers().length === 0) {
        throw new Error('onLaunchRequest must be implemented');
      }

      if (!this.requestHandlers[voxaEvent.request.type]) {
        throw new UnknownRequestType(voxaEvent.request.type);
      }

      const reply = ReplyFactory.makeReply(voxaEvent);
      const requestHandler = this.requestHandlers[voxaEvent.request.type];

      switch (voxaEvent.request.type) {
        case 'LaunchRequest':
        case 'IntentRequest':
        case 'SessionEndedRequest': {
          // call all onRequestStarted callbacks serially.
          return Promise.mapSeries(this.getOnRequestStartedHandlers(), fn => fn(voxaEvent, reply))
            .then(() => {
              if (!voxaEvent.session.new) {
                return null;
              }
              // call all onSessionStarted callbacks serially.
              return Promise.mapSeries(this.getOnSessionStartedHandlers(),
                fn => fn(voxaEvent, reply));
            })
          // Route the request to the proper handler which may have been overriden.
            .then(() => requestHandler(voxaEvent, reply));
        }

        default: {
          return requestHandler(voxaEvent, reply);
        }
      }
    })
      .catch(error => this.handleErrors(voxaEvent, error));
  }

  /*
   * Request handlers are in charge of responding to the different request types alexa sends,
   * in general they will defer to the proper event handler
   */
  registerRequestHandlers() {
    _(this.requestTypes)
      .filter(requestType => !this.requestHandlers[requestType])
      .forEach((requestType) => {
        const eventName = `on${requestType}`;
        this.registerEvent(eventName);

        this.requestHandlers[requestType] = (voxaEvent, reply) => {
          debug(eventName);
          const capitalizedEventName = capitalize(eventName);
          return Promise.mapSeries(this[`get${capitalizedEventName}Handlers`](), fn => fn.call(this, voxaEvent, reply))
            .then(_.last);
        };
      });
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

module.exports = VoxaSkill;
