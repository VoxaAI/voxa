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

  onPlaybackFail: function onPlaybackFail(request) {
    var reply = new alexa.helpers.reply();
    reply.append(_.at(responses, 'LaunchIntent.OpenResponse')[0]);
    return reply;
  },

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
var skill = new alexa.stateMachineSkill(appId, sm, responses, variables);

describe('StateMachineSkill', function () {
  itIs('playBackFailed', function (res) {
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
