/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

var assert = require('chai').assert
  // , expect = require('chai').expect
  , alexa = require('../')
  , appId = 'some-app-id'
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
    "entry": {
      to: {
        LaunchIntent: 'launch',
        "AMAZON.StopIntent": 'exit',
        "AMAZON.CancelIntent": 'exit'
      }
    },
    'exit': {
      enter: function enter(request) {
        return alexa.replyWith('ExitIntent.Farewell', 'die', request);
      }
    },
    'die': { isTerminal: true },
    "launch": {
    	enter: function enter(request) {
    		return alexa.replyWith('LaunchIntent.OpenResponse', 'die', request)
    	}
    }
  }
});
var skill = new alexa.stateMachineSkill(appId, sm);

describe('StateMachineSkill', function() {
	itIs('launch', function(res) {
		console.log(res);
	});

	function itIs(requestFile, cb) {
    it(requestFile,function(done){
      var event = require('./requests/' + requestFile + '.js');
      event.session.application.applicationId = appId;
      skill.execute(event, {
        succeed: function(response){
          try{ cb(response); }
          catch(e) { return done (e);}
          done();
        },
        fail: done
      });
    });
  }
});