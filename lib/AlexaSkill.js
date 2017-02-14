'use strict';

const Promise = require('bluebird');
const Reply = require('./Reply');
const Request = require('./Request');
const _ = require('lodash');
const debug = require('debug')('alexa-statemachine');
const UnknownRequestType = require('./Errors').UnkownRequestType;
const utils = require('./utils');

class AlexaSkill {
  constructor(appIds, config) {
    this.config = config;
    if (_.isArray(appIds)) {
      this.appIds = appIds;
    } else {
      this.appIds = [appIds];
    }

    this.requestTypes = [
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

    // Request handlers are in charge of responding to the different request types alexa sends, in general
    // they will defer to the proper event handler
    this.requestHandlers = {
      SessionEndedRequest: this.handleOnSessionEnded.bind(this),
    };

    // Event handlers are array of callbacks that get executed when an event is triggered
    // they can return a promise if async execution is needed
    this.eventHandlers = {};
      // Called when the request starts.
    this.registerEvent('onRequestStarted');

      // Called when the session starts.
    this.registerEvent('onSessionStarted');

      // Called when the user ends the session.
    this.registerEvent('onSessionEnded');

      // Sent whenever there's an unhandled error in the onIntent code
    this.registerEvent('onError');

    this.registerExtraRequestHandlers();

    this.onSessionEnded(() => ({ version: '1.0' }), true);
    this.onError((request, error) => {
      debug('onError %j', error);
      debug(error.stack);
      return new Reply(request, { tell: 'An unrecoverable error occurred.' }).write();
    }, true);
  }

  handleOnSessionEnded(request, reply) {
    return Promise.mapSeries(this.getOnSessionEndedHandlers(), fn => fn(request, reply))
      .then(_.last);
  }

  handleErrors(request, error) {
    // iterate on all error handlers and simply return the first one that
    // generates a reply
    //
    return Promise.reduce(this.getErrorHandlers('onError'), (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, error));
    }, null);
  }

  getErrorHandlers(errorType) {
    // we want the error handlers in reverse order
    return _(this.eventHandlers[errorType])
      .slice()
      .reverse()
    // but we also want the framework event handlers to always run last
      .concat(this.eventHandlers[`_${errorType}`])
      .value();
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

      if (_.concat(this.getOnLaunchRequestHandlers()).length === 0) {
        throw new Error('onLaunchRequest must be implemented');
      }

      if (!this.requestHandlers[request.type]) {
        throw new UnknownRequestType(request.type);
      }

      const reply = new Reply(request);
      const requestHandler = this.requestHandlers[request.type];

      switch (request.type) {
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

  registerExtraRequestHandlers() {
    _(this.requestTypes)
      .filter(requestType => !this.requestHandlers[requestType])
      .forEach((requestType) => {
        const eventName = `on${requestType}`;
        this.registerEvent(eventName);

        this.requestHandlers[requestType] = (request, reply) => {
          debug(eventName);
          const capitalizedEventName = utils.capitalize(eventName);
          return Promise.mapSeries(this[`get${capitalizedEventName}Handlers`](),
            fn => fn.call(this, request, reply)).then(_.last);
        };
      });
  }

  registerEvent(eventName) {
    this.eventHandlers[eventName] = [];
    this.eventHandlers[`_${eventName}`] = []; // we keep a separate list of internal event callbacks to alway execute them last
    if (!this[eventName]) {
      this[eventName] = (callback, internal) => {
        if (internal) {
          this.eventHandlers[`_${eventName}`].unshift(callback.bind(this));
        } else {
          this.eventHandlers[eventName].push(callback.bind(this));
        }
      };

      const capitalizedEventName = utils.capitalize(eventName);
      if (!this[`get${capitalizedEventName}Handlers`]) {
        this[`get${capitalizedEventName}Handlers`] = () => _.concat(this.eventHandlers[eventName], this.eventHandlers[`_${eventName}`]);
      }
    }
  }
}


module.exports = AlexaSkill;
