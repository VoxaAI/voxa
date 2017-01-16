'use strict';

const Promise = require('bluebird');
const Response = require('./Response');
const Request = require('./Request');

class AlexaSkill {
  constructor(appId) {
    this.appId = appId;

    this.intentHandlers = {};

    this.requestHandlers = {
      LaunchRequest: (request, response) => {
        this.eventHandlers.onLaunch(request, response);
      },

      IntentRequest: (request, response) => {
        this.eventHandlers.onIntent(request, response);
      },

      SessionEndedRequest: (request, response) => {
        Promise.mapSeries(this.eventHandlers.onSessionEnded, fn => fn(request, response))
        // Route the request to the proper handler which may have been overriden.
          .then(() => request.lambdaContext.succeed({ version: '1.0' }))
          .catch((err) => {
            console.log('Unexpected exception', err);
            request.lambdaContext.fail(err);
          });
      },

      'AudioPlayer.PlaybackStarted': (request, response) => {
        this.eventHandlers.onPlaybackStarted(request, response);
      },

      'AudioPlayer.PlaybackFinished': (request, response) => {
        this.eventHandlers.onPlaybackFinished(request, response);
      },

      'AudioPlayer.PlaybackNearlyFinished': (request, response) => {
        this.eventHandlers.onPlaybackNearlyFinished(request, response);
      },

      'AudioPlayer.PlaybackStopped': (request, response) => {
        this.eventHandlers.onPlaybackStopped(request, response);
      },

      'AudioPlayer.PlaybackFailed': (request, response) => {
        this.eventHandlers.onPlaybackFailed(request, response);
      },
    };

    this.eventHandlers = {
      /**
       * Called when the request starts.
       * Subclasses could have overriden this function to open any necessary resources.
       */

      onRequestStarted: [],
      /**
       * Called when the session starts.
       * Subclasses could have overriden this function to open any necessary resources.
       */
      onSessionStarted: [],

      /**
       * Called when the user invokes the skill without specifying what they want.
       * The subclass must override this function and provide feedback to the user.
       */
      onLaunch: (request, response) => {
        throw new Error('onLaunch should be overriden by subclass');
      },

      /**
       * Called when the user specifies an intent.
       */
      onIntent: (request, response) => {
        const intentName = request.intent.name;
        const intentHandler = this.intentHandlers[intentName];

        if (intentHandler) {
          console.log(`dispatch intent = ${intentName}`);
          intentHandler(request, response);
        } else {
          throw new Error(`Unsupported intent = ${intentName}`);
        }
      },

      /**
       * Called when the user ends the session.
       * Subclasses could have overriden this function to close any open resources.
       */
      onSessionEnded: [],

      /**
       * Sent when Alexa begins playing the audio stream previously sent in a Play directive.
       * This lets your skill verify that playback began successfully.
       * Subclasses could have overriden this function to open any necessary resources.
       */
      onPlaybackStarted: (request, response) => {},

      /**
       * Sent when the stream that Alexa is playing comes to an end on its own.
       * Subclasses could have overriden this function to open any necessary resources.
       */
      onPlaybackFinished: (request, response) => {},

      /**
       * Sent when the currently playing stream is nearly complete and the device
       * is ready to receive a new stream.
       * Subclasses could have overriden this function to open any necessary resources.
       */
      onPlaybackNearlyFinished: (request, response) => {},

      /**
       * Sent when Alexa stops playing an audio stream in response to a voice
       * request or an AudioPlayer directive.
       * Subclasses could have overriden this function to open any necessary resources.
       */
      onPlaybackStopped: (request, response) => {},

      /**
       * Sent when Alexa encounters an error when attempting to play a stream.
       * Subclasses could have overriden this function to open any necessary resources.
       */
      onPlaybackFailed: (request, response) => {},

    };
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

  execute(event, context) {
    // Validate that this request originated from authorized source.
    if (this.appId && event.session.application.applicationId !== this.appId) {
      console.log(`The applicationIds don't match: ${event.session.application.applicationId}  and  ${this.appId}`);
      throw new Error('Invalid applicationId');
    }

    const request = new Request(event, context);
    const response = new Response(request);
    try {
      const requestHandler = this.requestHandlers[request.type];

      switch (request.type) {
        case 'LaunchRequest':
        case 'IntentRequest':
        case 'SessionEndedRequest': {
          // call all onRequestStarted callbacks serially.
          Promise.mapSeries(this.eventHandlers.onRequestStarted, fn => fn(request, response))
            .then(() => {
              if (!request.session.new) {
                return null;
              }
              // call all onSessionStarted callbacks serially.
              return Promise.mapSeries(this.eventHandlers.onSessionStarted,
                fn => fn(request, response));
            })
          // Route the request to the proper handler which may have been overriden.
            .then(() => requestHandler(request, response))
            .catch((err) => {
              console.log('Unexpected exception', err);
              context.fail(err);
            });

          break;
        }

        case 'AudioPlayer.PlaybackStarted':
        case 'AudioPlayer.PlaybackFinished':
        case 'AudioPlayer.PlaybackNearlyFinished':
        case 'AudioPlayer.PlaybackStopped':
        case 'AudioPlayer.PlaybackFailed': {
          requestHandler(request, response);
          break;
        }

        default: {
          context.fail(new Error('Unkown event type'));
        }
      }
    } catch (e) {
      console.log('Unexpected exception ', e);
      context.fail(e);
    }
  }

}


module.exports = AlexaSkill;
