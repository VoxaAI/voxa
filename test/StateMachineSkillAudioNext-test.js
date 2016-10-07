/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('chai').assert,
  alexa = require('../'),
  appId = 'some-app-id',
  responses = require('./extras/responses'),
  variables = require('./extras/variables'),
  _ = require('lodash')
  ;

var sm = new alexa.stateMachine({
  onTransition: function onTransition(trans, request) { },

  onBadResponse: function onBadResponse(request) { },

  onAuthError: function onAuthError() { },

  onError: function onError(request, error) { },

  onSessionStart: function onSessionStart(request) { },

  onSessionEnd: function onSessionEnd(request) { },

  openIntent: 'LaunchIntent',
  states: {
    entry: {
      to: {
        LaunchIntent: 'launch',
        'AMAZON.NextIntent': 'next',
        'AMAZON.StopIntent': 'exit',
        'AMAZON.CancelIntent': 'exit',
      },
    },
    next: {
      enter: function enter(request, context) {
        var index = 0;
        var shuffle = 0;
        var loop = 0;

        if (context && context.AudioPlayer) {
          var token = JSON.parse(context.AudioPlayer.token);
          index = token.index + 1;
          shuffle = token.shuffle;
          loop = token.loop;
        }
        
        if(index === TEST_URLS.length) {
          index = 0;
        }

        var directives = {};
        directives.type = "AudioPlayer.Play";
        directives.playBehavior = "REPLACE_ALL";
        directives.token = createToken(index, shuffle, loop);
        directives.url = TEST_URLS[index];
        directives.offsetInMilliseconds = 0;

        return alexa.replyWithAudioDirectives('LaunchIntent.OpenResponse', 'die', request, null, directives);
      },
    },
    exit: {
      enter: function enter(request, context) {
        return alexa.replyWith('ExitIntent.Farewell', 'die', request);
      },
    },
    die: { isTerminal: true },
    launch: {
      enter: function enter(request, context) {
        return alexa.replyWith('LaunchIntent.OpenResponse', 'die', request);
      },
    },
  },
});

function createToken(index, shuffle, loop) {
  var token = {};
  token.index = index;
  token.shuffle = shuffle;
  token.loop = loop;

  return JSON.stringify(token);
}

var skill = new alexa.stateMachineSkill(appId, sm, responses, variables);

var TEST_URLS = [
    "https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3",
    "https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3",
    "https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3"
];

describe('StateMachineSkill', function () {
  itIs('audioNext', function (res) {
    assert.include(res.response.outputSpeech.ssml, 'Hello! Good');
  });

  function itIs(requestFile, cb) {
    it(requestFile, function (done) {
      var event = require('./requests/' + requestFile + '.js');
      event.context.System.application.applicationId = appId;
      skill.execute(event, {
        succeed: function (response) {
          try { cb(response); }
          catch (e) { return done(e);}

          done();
        },

        fail: done,
      });
    });
  }
});
