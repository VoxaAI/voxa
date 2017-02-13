'use strict';

const Promise = require('bluebird');
const Reply = require('./Reply');
const Request = require('./Request');
const _ = require('lodash');
const debug = require('debug')('alexa-statemachine');
const UnknownRequestType = require('./Errors').UnkownRequestType;

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

    this.requestHandlers = {
      SessionEndedRequest: (request, reply) => this.handleOnSessionEnded(request, reply).then(() => ({ version: '1.0' })),
    };


    // Event handlers are array of callbacks that get executed when an event is triggered
    // they can return a promise if async execution is needed
    this.eventHandlers = {
      // Called when the request starts.
      onRequestStarted: [],

      // Called when the session starts.
      onSessionStarted: [],

      // Called when the user ends the session.
      onSessionEnded: [],

      // Sent whenever there's an unhandled error in the onIntent code
      onError: [],
    };

    this.registerExtraRequestHandlers();

    this.onError((request, error) => {
      debug('onError %s', error);
      return new Reply(request, { tell: 'An unrecoverable error occurred.' }).write();
    });
  }

  handleOnSessionEnded(request, reply) {
    return Promise.mapSeries(this.eventHandlers.onSessionEnded, fn => fn(request, reply));
  }


  handleErrors(request, error) {
    // iterate on all error handlers and simply return the first one that
    // generates a reply
    return Promise.reduce(this.eventHandlers.onError, (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, error));
    }, null);
  }

  onSessionStarted(callback) {
    this.eventHandlers.onSessionStarted.push(callback);
  }

  onRequestStarted(callback) {
    this.eventHandlers.onRequestStarted.push(callback);
  }

  onSessionEnded(callback) {
    this.eventHandlers.onSessionEnded.push(callback);
  }

  onError(callback) {
    this.eventHandlers.onError.unshift(callback);
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

      if (this.eventHandlers.onLaunchRequest.length === 0) {
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
          return Promise.mapSeries(this.eventHandlers.onRequestStarted, fn => fn(request, reply))
            .then(() => {
              if (!request.session.new) {
                return null;
              }
              // call all onSessionStarted callbacks serially.
              return Promise.mapSeries(this.eventHandlers.onSessionStarted,
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
        const eventHandlerLabel = `on${requestType}`;
        this.eventHandlers[eventHandlerLabel] = [];
        this.requestHandlers[requestType] = (request, reply) => {
          debug(eventHandlerLabel);
          return Promise.mapSeries(this.eventHandlers[eventHandlerLabel], fn => fn(request, reply)).then(_.last);
        };

        this[eventHandlerLabel] = (callback) => {
          this.eventHandlers[eventHandlerLabel].unshift(callback);
        };
      });
  }

}


module.exports = AlexaSkill;
