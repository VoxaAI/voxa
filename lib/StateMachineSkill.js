'use strict';

var _ = require('lodash')
    , AlexaSkill = require('./AlexaSkill')
    , Request = require('./Request')
    , Reply = require('alexa-helpers').reply
    , MessageRenderer = require('alexa-helpers').messageRenderer
    , messageRenderer = null
    , Promise = require('bluebird')
    , universalAnalytics = require('universal-analytics')
    , verbose = true
  ;

var StateMachineSkill = module.exports = function (appId, StateMachine, responses, variables, config) {
  var self = this;
  self._StateMachine = StateMachine;
  self._responses = responses || {};
  self._variables = variables || {};
  self._config = config || { verbose: verbose };
  if (typeof self._config.verbose != undefined) verbose = self._config.verbose;
  messageRenderer = MessageRenderer(self._responses, self._variables);
  AlexaSkill.call(self, appId);
};

module.exports.verbose = verbose;

// Extend AlexaSkill
StateMachineSkill.prototype = Object.create(AlexaSkill.prototype);
StateMachineSkill.prototype.constructor = StateMachineSkill;

var ERRORS = module.exports.ERRORS = {
  AUTHORIZATION: 'Authorization Error',
  BAD_RESPONSE: 'Bad Response Error'
};

StateMachineSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  var self = this;
  if (self._config.verbose) console.log("onSessionStarted requestId: " + sessionStartedRequest.requestId + ", sessionId: " + session.sessionId);
  var handler = self._StateMachine.onSessionStart;
  if (handler) handler(new Request(sessionStartedRequest, session));
};

StateMachineSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  var self = this;
  if (self._config.verbose) console.log("onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  var intent = self._StateMachine.openIntent;
  self.eventHandlers.onIntent.call(self,{
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
  var self = this;
  if (self._config.verbose) console.log("onSessionEnded requestId: " + sessionEndedRequest.requestId + ", sessionId: " + session.sessionId);
  var handler = self._StateMachine.onSessionEnd;
  if (handler) handler(new Request(sessionEndedRequest, session));
};

StateMachineSkill.prototype.eventHandlers.onIntent = function (request, session, response) {
  var self = this;

  if (self._config.verbose) console.log('Got intent ' + request.intent.name);
  var fromState = session.new ? 'entry' : session.attributes.state || 'entry',
      stateMachine = self._StateMachine(fromState),
      request = new Request(request, session),
      qTransition = stateMachine.transition(request);
  return qTransition.then(function (trans) {
    return transitionEndingInterceptor.call(self, trans, stateMachine, request);
  }).then(function (trans) {
    if (self._config.verbose) console.log('Yielding to [' + (trans.to ? trans.to.name : 'nowhere') + ']');
    if (trans.to) response._session.attributes.state = trans.to.name;else trans.reply.end();
    trans.reply.write(response);
  }).catch(respondError.call(self, stateMachine, request, response));
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
  var self = this;
  var errorMsg = self._StateMachine.onAuthError();
  errorMsg.write(response);
}

function respondBadResponse(stateMachine, request, response) {
  var self = this;

  Promise.try(function () {
    return self._StateMachine.onBadResponse(request);
  }).then(function (reply) {
    if (reply) {
      if (self._config.verbose) console.log('Got an error response, and it was handled by a custom handler');
      reply.write(response);
    } else {
      respondError(stateMachine, request, response)();
    }
  }).catch(respondError(stateMachine, request, response));
}

function respondError(stateMachine, request, response) {
  var self = this;
  return function (error) {
    if (error && (error.statusCode == 401 || error == ERRORS.AUTHORIZATION)) return respondAuthFailure.call(self, response);
    console.error('Respond with error', error ? error.stack || error.statusCode || error : 'unknown');
    if (error && error == ERRORS.BAD_RESPONSE) return respondBadResponse.call(self, stateMachine, request, response);
    Promise.try(function () {
      return stateMachine.onError(request, error);
    }).then(function (errorMsg) {
      //Can give back a transition or a message. Even if it's a transition, we ignore it and just say the message
      if (errorMsg.message) errorMsg = new Reply(errorMsg.message);
      errorMsg.write(response);
    }).catch(function () {
      new Reply({ tell: 'An unrecoverable error occurred.' }).write(response);
    });
  }.bind(self);
}

var replyWith = module.exports.replyWith = function(msgPath, state, request, data) {
  var self = this;
  if (verbose) console.log('Move to state [' + state + '] and say ' + msgPath);
  return renderMessage(msgPath, data).then(function (msg) {
    // For AMAZON.RepeatIntent
    var reply = null;
    if (msg && msg.ask) reply = { msgPath: msgPath, state: state };
    return {
      message: msg,
      to: state,
      session: {
        data: data ? data.serialize() : request.session.attributes.data,
        startTimestamp: request.session.attributes.startTimestamp,
        reply: reply
      }
    };
  });
}

function renderMessage(msgPath, data) {
  if (!msgPath) return Promise.resolve(null);
  return messageRenderer(msgPath, data);
}

function SimpleHelpMessage(msgPath, analyticEvent, toState) {
  return {
    enter: function enter(request) {
      //var analytics = universalAnalytics(config.googleAnalytics.trackingCode, request.session.user.userId, { strictCidFormat: false });
      analytics(request).event('Help Flow', analyticEvent).send();
      return replyWith(msgPath, toState || 'die', request, null);
    }
  };
}

function analytics(request) {
  return universalAnalytics(config.googleAnalytics.trackingCode, request.session.user.userId, { strictCidFormat: false });
}
