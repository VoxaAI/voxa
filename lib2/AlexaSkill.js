'use strict';

const Promise = require('bluebird');
const Reply = require('./Reply');
const Request = require('./Request');
const _ = require('lodash');
const debug = require('debug')('alexa-statemachine');

class AlexaSkill {
  constructor(appIds) {
    if (_.isArray(appIds)) {
      this.appIds = appIds;
    } else {
      this.appIds = [appIds];
    }

    this.intentHandlers = {};

    this.requestHandlers = {
      LaunchRequest: (request, reply) => Promise.mapSeries(
        this.eventHandlers.onLaunch, fn => fn(request, reply)).then(_.last),

      IntentRequest: (request, reply) => Promise.mapSeries(
        this.eventHandlers.onIntent, fn => fn(request, reply)).then(_.last),

      SessionEndedRequest: (request, reply) => this.handleOnSessionEnded(request, reply)
      .then(() => ({ version: '1.0' })),

      'AudioPlayer.PlaybackStarted': (request, reply) => Promise.mapSeries(this.eventHandlers.onPlaybackStarted, fn => fn(request, reply)),

      'AudioPlayer.PlaybackFinished': (request, reply) => Promise.mapSeries(this.eventHandlers.onPlaybackFinished, fn => fn(request, reply)),

      'AudioPlayer.PlaybackNearlyFinished': (request, reply) => Promise.mapSeries(this.eventHandlers.onPlaybackNearlyFinished, fn => fn(request, reply)),

      'AudioPlayer.PlaybackStopped': (request, reply) => Promise.mapSeries(this.eventHandlers.onPlaybackStopped, fn => fn(request, reply)),

      'AudioPlayer.PlaybackFailed': (request, reply) => Promise.mapSeries(this.eventHandlers.onPlaybackFailed, fn => fn(request, reply)),
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

      // Sent whenever there's an unhandled error in the onIntent code
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

    this.onError((request, error) => new Reply(request, { tell: 'An unrecoverable error occurred.' }).write());
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

  onLaunch(callback) {
    this.eventHandlers.onLaunch.push(callback);
  }

  onIntentRequest(callback) {
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

  execute(event) {
    debug('Received new event: %s', JSON.stringify(event));
    const request = new Request(event);
    return Promise.try(() => {
      // Validate that this request originated from authorized source.
      if (!_.includes(this.appIds, event.session.application.applicationId)) {
        debug(`The applicationIds don't match: "${event.session.application.applicationId}"  and  "${this.appIds}"`);
        throw new Error('Invalid applicationId');
      }

      if (this.eventHandlers.onLaunch.length === 0) {
        throw new Error('onLaunch must be implemented');
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

        case 'AudioPlayer.PlaybackStarted':
        case 'AudioPlayer.PlaybackFinished':
        case 'AudioPlayer.PlaybackNearlyFinished':
        case 'AudioPlayer.PlaybackStopped':
        case 'AudioPlayer.PlaybackFailed': {
          return requestHandler(request, reply);
        }

        default: {
          throw new Error('Unkown event type');
        }
      }
    })
      .catch(error => this.handleErrors(request, error));
  }

}


module.exports = AlexaSkill;
