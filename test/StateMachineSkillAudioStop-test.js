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
        'AMAZON.StopIntent': 'exit',
        'AMAZON.CancelIntent': 'exit',
      },
    },
    exit: {
      enter: function enter(request, context) {
        var directives = {};
        directives.type = "AudioPlayer.Stop";
        return alexa.replyWith('ExitIntent.Farewell', 'die', request, null, directives);
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
var skill = new alexa.stateMachineSkill(appId, sm, responses, variables);

describe('StateMachineSkill', function () {
  itIs('audioStop', function (res) {
    assert.include(res.response.outputSpeech.ssml, 'For more info visit');
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
