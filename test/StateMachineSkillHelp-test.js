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
  variables = require('./extras/variables')
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
        'AMAZON.HelpIntent': 'help',
        'AMAZON.StopIntent': 'exit',
        'AMAZON.CancelIntent': 'exit',
      },
    },
    help: {
      enter: function enter(request) {
        return alexa.replyWith('HelpIntent.HelpAboutSkill', 'die', request);
      },
    },
    exit: {
      enter: function enter(request) {
        return alexa.replyWith('ExitIntent.Farewell', 'die', request);
      },
    },
    die: { isTerminal: true },
    launch: {
      enter: function enter(request) {
        return alexa.replyWith('LaunchIntent.OpenResponse', 'die', request);
      },
    },
  },
});
var skill = new alexa.stateMachineSkill(appId, sm, responses, variables);

describe('StateMachineSkill Help test', function () {
  itIs('help', function (res) {
    assert.include(res.response.outputSpeech.ssml, 'For more help visit');
  });

  function itIs(requestFile, cb) {
    it(requestFile, function (done) {
      var event = require('./requests/' + requestFile + '.js');
      event.session.application.applicationId = appId;
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
