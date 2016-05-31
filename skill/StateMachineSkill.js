'use strict';

var _ = require('lodash'),
    AlexaSkill = require('./AlexaSkill'),
    responses = require('./responses'),
    Request = require('./Request.js'),
    Reply = require('./reply'),
    verbose = require('../config').verbose,
    Promise = require('bluebird');

var StateMachineSkill = module.exports = function (appId, StateMachine) {
  this._StateMachine = StateMachine;
  AlexaSkill.call(this, appId);
};

// Extend AlexaSkill
StateMachineSkill.prototype = Object.create(AlexaSkill.prototype);
StateMachineSkill.prototype.constructor = StateMachineSkill;

var ERRORS = module.exports.ERRORS = {
  AUTHORIZATION: 'Authorization Error',
  BAD_RESPONSE: 'Bad Response Error'
};

StateMachineSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
  var handler = this._StateMachine.onSessionStart;
  if (handler) handler(new Request(sessionStartedRequest, session));
};

StateMachineSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  var intent = this._StateMachine.openIntent;
  this.eventHandlers.onIntent.call(this,{
    "type": "IntentRequest",
    "requestId": launchRequest.requestId,
    "timestamp": launchRequest.timestamp,
    "intent": {
        "name": intent,
        "slots": {}
    }

  },session,response);
};

StateMachineSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
  var handler = this._StateMachine.onSessionEnd;
  if (handler) handler(new Request(sessionEndedRequest, session));
};

StateMachineSkill.prototype.eventHandlers.onIntent = function (request, session, response) {
  var self = this;

  if (verbose) console.log('Got intent ' + request.intent.name);
  var fromState = session.new ? 'entry' : session.attributes.state || 'entry',
      stateMachine = this._StateMachine(fromState),
      request = new Request(request, session),
      qTransition = stateMachine.transition(request);
  return qTransition.then(function (trans) {
    return transitionEndingInterceptor.call(self, trans, stateMachine, request);
  }).then(function (trans) {

    if (verbose) console.log('Yielding to [' + (trans.to ? trans.to.name : 'nowhere') + ']');
    if (trans.to) response._session.attributes.state = trans.to.name;else trans.reply.end();
    trans.reply.write(response);
  }).catch(respondError.call(this, stateMachine, request, response));
};

function transitionEndingInterceptor(trans, stateMachine, request) {
  if (!stateMachine.onTransition) return trans;
  return Promise.try(function () {
    return stateMachine.onTransition(trans, request);
  }).then(function (back) {
    return back || trans;
  });
}

function respondAuthFailure(response) {
  var errorMsg = this._StateMachine.onAuthError();
  errorMsg.write(response);
}

function respondBadResponse(stateMachine, request, response) {
  var _this = this;

  Promise.try(function () {
    return _this._StateMachine.onBadResponse(request);
  }).then(function (reply) {
    if (reply) {
      if (verbose) console.log('Got an error response, and it was handled by a custom handler');
      reply.write(response);
    } else {
      respondError(stateMachine, request, response)();
    }
  }).catch(respondError(stateMachine, request, response));
}

function respondError(stateMachine, request, response) {
  return function (error) {
    var self = this;
    if (error && (error.statusCode == 401 || error == ERRORS.AUTHORIZATION)) return respondAuthFailure.call(this, response);
    console.error('Respond with error', error ? error.stack || error.statusCode || error : 'unknown');
    if (error && error == ERRORS.BAD_RESPONSE) return respondBadResponse.call(this, stateMachine, request, response);
    Promise.try(function () {
      return stateMachine.onError(request, error);
    }).then(function (errorMsg) {
      //Can give back a transition or a message. Even if it's a transition, we ignore it and just say the message
      if (errorMsg.message) errorMsg = new Reply(errorMsg.message);
      errorMsg.write(response);
    }).catch(function () {
      new Reply({ tell: 'An unrecoverable error occurred.' }).write(response);
    });
  }.bind(this);
}
