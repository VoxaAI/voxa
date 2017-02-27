'use strict';

const Promise = require('bluebird');
const Reply = require('./Reply');
const Request = require('./Request');
const _ = require('lodash');
const debug = require('debug')('alexa-statemachine');
const UnknownRequestType = require('./Errors').UnkownRequestType;
const capitalize = require('capitalize');

class AlexaSkill {
  constructor(appIds, config) {
    this.config = config;
    if (_.isArray(appIds)) {
      this.appIds = appIds;
    } else {
      this.appIds = [appIds];
    }

    this.eventHandlers = {};
    this.requestHandlers = {
      SessionEndedRequest: this.handleOnSessionEnded.bind(this),
    };
    this.registerRequestHandlers();
    this.registerEvents();

    this.onSessionEnded(() => ({ version: '1.0' }), true);
    this.onError((request, error) => {
      debug('onError %s', error);
      debug(error.stack);
      return new Reply(request, { tell: 'An unrecoverable error occurred.' });
    }, true);
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

  handleOnSessionEnded(request, reply) {
    return Promise.mapSeries(this.getOnSessionEndedHandlers(), fn => fn(request, reply))
      .then(_.last);
  }

  /*
   * iterate on all error handlers and simply return the first one that
   * generates a reply
   */
  handleErrors(request, error) {
    return Promise.reduce(this.getOnErrorHandlers(), (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, error));
    }, null)
      .then((reply) => {
        if (reply instanceof Reply) {
          return reply.write();
        }

        return reply;
      });
  }

  execute(event) {
    debug('Received new event: %s', JSON.stringify(event));
    return Promise.try(() => {
      const request = new Request(event);
      // Validate that this request originated from authorized source.
      if (this.config.env === 'production' && !_.includes(this.appIds, event.session.application.applicationId)) {
        debug(`The applicationIds don't match: "${event.session.application.applicationId}"  and  "${this.appIds}"`);
        throw new Error('Invalid applicationId');
      }

      if (this.getOnLaunchRequestHandlers().length === 0) {
        throw new Error('onLaunchRequest must be implemented');
      }

      if (!this.requestHandlers[request.request.type]) {
        throw new UnknownRequestType(request.request.type);
      }

      const reply = new Reply(request);
      const requestHandler = this.requestHandlers[request.request.type];

      switch (request.request.type) {
        case 'LaunchRequest':
        case 'IntentRequest':
        case 'SessionEndedRequest': {
          // call all onRequestStarted callbacks serially.
          return Promise.mapSeries(this.getOnRequestStartedHandlers(), fn => fn(request, reply))
            .then(() => {
              if (!request.session.new) {
                return null;
              }
              // call all onSessionStarted callbacks serially.
              return Promise.mapSeries(this.getOnSessionStartedHandlers(),
                fn => fn(request, reply));
            })
          // Route the request to the proper handler which may have been overriden.
            .then(() => requestHandler(request, reply));
        }

        default: {
          return requestHandler(request, reply);
        }
      }
    })
      .catch(error => this.handleErrors(event, error));
  }

  /*
   * Request handlers are in charge of responding to the different request types alexa sends, in general
   * they will defer to the proper event handler
   */
  registerRequestHandlers() {
    _(this.requestTypes)
      .filter(requestType => !this.requestHandlers[requestType])
      .forEach((requestType) => {
        const eventName = `on${requestType}`;
        this.registerEvent(eventName);

        this.requestHandlers[requestType] = (request, reply) => {
          debug(eventName);
          const capitalizedEventName = capitalize(eventName);
          return Promise.mapSeries(this[`get${capitalizedEventName}Handlers`](), fn => fn.call(this, request, reply))
            .then(_.last)
            .then((requestReply) => {
              if (requestReply instanceof Reply) {
                return requestReply.write();
              }

              return requestReply;
            });
        };
      });
  }

  /*
   * Event handlers are array of callbacks that get executed when an event is triggered
   * they can return a promise if async execution is needed, most are registered with the request handlers
   * however there are some that don't map exactly to a request and we register them in here,
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

module.exports = AlexaSkill;
