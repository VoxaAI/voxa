'use strict';

const Promise = require('bluebird');
const Reply = require('./Reply');
const AlexaEvent = require('./AlexaEvent');
const _ = require('lodash');
const debug = require('debug')('voxa');
const UnknownRequestType = require('./Errors').UnkownRequestType;
const capitalize = require('capitalize');
const createServer = require('./create-server');

class AlexaSkill {
  constructor(config) {
    this.config = config;
    this.eventHandlers = {};
    this.requestHandlers = {
      SessionEndedRequest: this.handleOnSessionEnded.bind(this),
    };
    this.registerRequestHandlers();
    this.registerEvents();

    this.onSessionEnded(() => ({ version: '1.0' }), true);
    this.onError((alexaEvent, error) => {
      debug('onError %s', error);
      debug(error.stack);
      return new Reply(alexaEvent, { tell: 'An unrecoverable error occurred.' });
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

  handleOnSessionEnded(alexaEvent, reply) {
    return Promise.mapSeries(this.getOnSessionEndedHandlers(), fn => fn(alexaEvent, reply))
      .then(_.last);
  }

  /*
   * iterate on all error handlers and simply return the first one that
   * generates a reply
   */
  handleErrors(alexaEvent, error) {
    return Promise.reduce(this.getOnErrorHandlers(), (reply, errorHandler) => {
      if (reply) {
        return reply;
      }
      return Promise.resolve(errorHandler(alexaEvent, error));
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

  execute(event) {
    debug('Received new event: %s', JSON.stringify(event));
    const alexaEvent = new AlexaEvent(event);
    return Promise.try(() => {
      // Validate that this AlexaRequest originated from authorized source.
      if (this.config.appIds) {
        const appId = event.context.application.applicationId;

        if (_.isString(this.config.appIds) && this.config.appIds !== appId) {
          debug(`The applicationIds don't match: "${event.context.application.applicationId}"  and  "${this.config.appIds}"`);
          throw new Error('Invalid applicationId');
        }

        if (_.isArray(this.config.appIds) && !_.includes(this.config.appIds, appId)) {
          debug(`The applicationIds don't match: "${event.context.application.applicationId}"  and  "${this.config.appIds}"`);
          throw new Error('Invalid applicationId');
        }
      }


      if (this.getOnLaunchRequestHandlers().length === 0) {
        throw new Error('onLaunchRequest must be implemented');
      }

      if (!this.requestHandlers[alexaEvent.request.type]) {
        throw new UnknownRequestType(alexaEvent.request.type);
      }

      const reply = new Reply(alexaEvent);
      const requestHandler = this.requestHandlers[alexaEvent.request.type];

      switch (alexaEvent.request.type) {
        case 'LaunchRequest':
        case 'IntentRequest':
        case 'SessionEndedRequest': {
          // call all onRequestStarted callbacks serially.
          return Promise.mapSeries(this.getOnRequestStartedHandlers(), fn => fn(alexaEvent, reply))
            .then(() => {
              if (!alexaEvent.session.new) {
                return null;
              }
              // call all onSessionStarted callbacks serially.
              return Promise.mapSeries(this.getOnSessionStartedHandlers(),
                fn => fn(alexaEvent, reply));
            })
          // Route the request to the proper handler which may have been overriden.
            .then(() => requestHandler(alexaEvent, reply));
        }

        default: {
          return requestHandler(alexaEvent, reply);
        }
      }
    })
      .catch(error => this.handleErrors(alexaEvent, error));
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

        this.requestHandlers[requestType] = (alexaEvent, reply) => {
          debug(eventName);
          const capitalizedEventName = capitalize(eventName);
          return Promise.mapSeries(this[`get${capitalizedEventName}Handlers`](), fn => fn.call(this, alexaEvent, reply))
            .then(_.last);
        };
      });
  }

  /*
   * Event handlers are array of callbacks that get executed when an event is triggered
   * they can return a promise if async execution is needed,
   * most are registered with the alexaEvent handlers
   * however there are some that don't map exactly to a alexaEvent and we register them in here,
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
