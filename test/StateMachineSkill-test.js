/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('chai').assert,
  alexa = require('../'),
  appId = ['some-app-id'],
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
        'AMAZON.StopIntent': 'exit',
        'AMAZON.CancelIntent': 'exit',
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

var skillSingleAppId = new alexa.stateMachineSkill(appId[0], sm, responses, variables);
var skillMultipleAppId = new alexa.stateMachineSkill(appId, sm, responses, variables);

describe('StateMachineSkill with single appId', function () {
  itIs('launch', function (res) {
    assert.include(res.response.outputSpeech.ssml, 'Hello! Good');
  });

  function itIs(requestFile, cb) {
    it(requestFile, function (done) {
      var event = require('./requests/' + requestFile + '.js');
      event.session.application.applicationId = appId[0];
      skillSingleAppId.execute(event, {
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

describe('StateMachineSkill with multiple appId', function () {
  itIs('launch', function (res) {
    assert.include(res.response.outputSpeech.ssml, 'Hello! Good');
  });

  function itIs(requestFile, cb) {
    it(requestFile, function (done) {
      var event = require('./requests/' + requestFile + '.js');
      event.session.application.applicationId = appId[0];
      skillMultipleAppId.execute(event, {
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

describe('StateMachineSkill with multiple appId invalid appId', function () {
  itIs('launch', function (res) {
    assert.include(res.response.outputSpeech.ssml, 'Hello! Good');
  });

  function itIs(requestFile, cb) {
    it(requestFile, function (done) {
      var event = require('./requests/' + requestFile + '.js');
      event.session.application.applicationId = 'FAKE ID';
      skillMultipleAppId.execute(event, {
        succeed: function (response) {
          done(new Error('Should throw invalid application id'));
        },

        fail: function (e) {
          assert.equal(e, 'Invalid applicationId');
          done();
        },
      });
    });
  }
});
