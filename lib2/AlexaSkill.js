'use strict';

const Promise = require('bluebird');
const Response = require('./Response');
const Request = require('./Request');
const _ = require('lodash');
const Reply = require('./Reply');

class AlexaSkill {
  constructor(appId) {
    this.appId = appId;

    this.intentHandlers = {};

    this.requestHandlers = {
      LaunchRequest: (request, response) => Promise.mapSeries(
        this.eventHandlers.onLaunch, fn => fn(request, response)).then(_.last),

      IntentRequest: (request, response) => Promise.mapSeries(
        this.eventHandlers.onIntent, fn => fn(request, response)).then(_.last),

      SessionEndedRequest: (request, response) => Promise.mapSeries(
        this.eventHandlers.onSessionEnded, fn => fn(request, response))
      // Route the request to the proper handler which may have been overriden.
      .then(() => ({ version: '1.0' })),

      'AudioPlayer.PlaybackStarted': (request, response) => Promise.mapSeries(this.eventHandlers.onPlaybackStarted, fn => fn(request, response)),

      'AudioPlayer.PlaybackFinished': (request, response) => Promise.mapSeries(this.eventHandlers.onPlaybackFinished, fn => fn(request, response)),

      'AudioPlayer.PlaybackNearlyFinished': (request, response) => Promise.mapSeries(this.eventHandlers.onPlaybackNearlyFinished, fn => fn(request, response)),

      'AudioPlayer.PlaybackStopped': (request, response) => Promise.mapSeries(this.eventHandlers.onPlaybackStopped, fn => fn(request, response)),

      'AudioPlayer.PlaybackFailed': (request, response) => Promise.mapSeries(this.eventHandlers.onPlaybackFailed, fn => fn(request, response)),
    };

    this.eventHandlers = {
      /**
       * Called when the request starts.
       */

      onRequestStarted: [],
      /**
       * Called when the session starts.
       */
      onSessionStarted: [],

      /**
       * Called when the user invokes the skill without specifying what they want.
       */
      onLaunch: [],

      /**
       * Called when the user specifies an intent.
       */
      onIntent: [],

      /**
       * Called when the user ends the session.
       */
      onSessionEnded: [],

      /**
       * Sent when the state machien failed to return a carrect response
       */
      onBadResponse: [],

      /**
       * Sent whenever there's an unhandled error in the onIntent code
       */
      onError: [],

      /**
       * Sent when Alexa begins playing the audio stream previously sent in a Play directive.
       * This lets your skill verify that playback began successfully.
       */
      onPlaybackStarted: [],

      /**
       * Sent when the stream that Alexa is playing comes to an end on its own.
       */
      onPlaybackFinished: [],

      /**
       * Sent when the currently playing stream is nearly complete and the device
       * is ready to receive a new stream.
       */
      onPlaybackNearlyFinished: [],

      /**
       * Sent when Alexa stops playing an audio stream in response to a voice
       * request or an AudioPlayer directive.
       */
      onPlaybackStopped: [],

      /**
       * Sent when Alexa encounters an error when attempting to play a stream.
       */
      onPlaybackFailed: [],

    };

    this.onIntent((request, response) => {
      const intentName = request.intent.name;
      const intentHandler = this.intentHandlers[intentName];

      if (intentHandler) {
        console.log(`dispatch intent = ${intentName}`);
        return intentHandler(request, response);
      }
      throw new Error(`Unsupported intent = ${intentName}`);
    });

    // default onBadResponse action is to just defer to the general error handler
    this.onBadResponse((request, response, error) => this.handleErrors(request, response, error));
    this.onError((request, response, error) => new Reply({ tell: 'An unrecoverable error occurred.' }).write(response));
  }

  handleOnBadResponseErrors(request, response, error) {
    // iterate on all error handlers and simply return the first one that
    // generates a response
    return Promise.reduce(this.eventHandlers.onBadResponse, (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, response, error));
    }, null);
  }

  handleErrors(request, response, error) {
    // iterate on all error handlers and simply return the first one that
    // generates a response
    return Promise.reduce(this.eventHandlers.onError, (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, response, error));
    }, null);
  }

  onLaunch(callback) {
    this.eventHandlers.onLaunch.push(callback);
  }

  onIntent(callback) {
    this.eventHandlers.onIntent.push(callback);
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

  onBadResponse(callback) {
    this.eventHandlers.onBadResponse.unshift(callback);
  }

  onError(callback) {
    this.eventHandlers.onError.unshift(callback);
  }

  onPlaybackFailed(callback) {
    this.eventHandlers.onPlaybackFailed.push(callback);
  }

  onPlaybackFinished(callback) {
    this.eventHandlers.onPlaybackFinished.push(callback);
  }

  onPlaybackStopped(callback) {
    this.eventHandlers.onPlaybackStopped.push(callback);
  }

  execute(event, context) {
    return Promise.try(() => {
      // Validate that this request originated from authorized source.
      if (this.appId && event.session.application.applicationId !== this.appId) {
        console.log(`The applicationIds don't match: ${event.session.application.applicationId}  and  ${this.appId}`);
        throw new Error('Invalid applicationId');
      }

      if (this.eventHandlers.onLaunch.length === 0) {
        throw new Error('onLaunch must be implemented');
      }

      const request = new Request(event, context);
      const response = new Response(request);
      const requestHandler = this.requestHandlers[request.type];

      switch (request.type) {
        case 'LaunchRequest':
        case 'IntentRequest':
        case 'SessionEndedRequest': {
          // call all onRequestStarted callbacks serially.
          return Promise.mapSeries(this.eventHandlers.onRequestStarted, fn => fn(request, response))
            .then(() => {
              if (!request.session.new) {
                return null;
              }
              // call all onSessionStarted callbacks serially.
              return Promise.mapSeries(this.eventHandlers.onSessionStarted,
                fn => fn(request, response));
            })
          // Route the request to the proper handler which may have been overriden.
            .then(() => requestHandler(request, response));
        }

        case 'AudioPlayer.PlaybackStarted':
        case 'AudioPlayer.PlaybackFinished':
        case 'AudioPlayer.PlaybackNearlyFinished':
        case 'AudioPlayer.PlaybackStopped':
        case 'AudioPlayer.PlaybackFailed': {
          return requestHandler(request, response);
        }

        default: {
          throw new Error('Unkown event type');
        }
      }
    });
  }

}


module.exports = AlexaSkill;
