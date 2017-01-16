'use strict';

let _ = require('lodash'),
  AlexaSkill = require('./AlexaSkill'),
  Request = require('./Request'),
  Reply = require('alexa-helpers').reply,
  MessageRenderer = require('alexa-helpers').messageRenderer,
  messageRenderer = null,
  Promise = require('bluebird'),
  universalAnalytics = require('universal-analytics'),
  verbose = true
  ;

const StateMachineSkill = module.exports = function (appId,
  StateMachine,
  responses,
  variables,
  config) {
  const _this = this;
  _this._StateMachine = StateMachine;
  _this._responses = responses || {};
  _this._variables = variables || {};
  _this._config = config || { verbose };
  if (typeof _this._config.verbose !== undefined) verbose = _this._config.verbose;
  messageRenderer = MessageRenderer(_this._responses, _this._variables);
  AlexaSkill.call(_this, appId);
};

module.exports.verbose = verbose;

// Extend AlexaSkill
StateMachineSkill.prototype = Object.create(AlexaSkill.prototype);
StateMachineSkill.prototype.constructor = StateMachineSkill;

const ERRORS = module.exports.ERRORS = {
  AUTHORIZATION: 'Authorization Error',
  BAD_RESPONSE: 'Bad Response Error',
};

StateMachineSkill.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest,
  session) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onSessionStarted requestId: ${
    sessionStartedRequest.requestId}, sessionId: ${session.sessionId}`);
  }
  const handler = _this._StateMachine.onSessionStart;
  if (handler) return handler(new Request(sessionStartedRequest, session));
};

StateMachineSkill.prototype.eventHandlers.onLaunch = function (launchRequest, session,
  response, context) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onLaunch requestId: ${launchRequest.requestId}, sessionId: ${
      session.sessionId}`);
  }
  const intent = _this._StateMachine.openIntent;
  _this.eventHandlers.onIntent.call(_this, {
    type: 'IntentRequest',
    requestId: launchRequest.requestId,
    timestamp: launchRequest.timestamp,
    intent: {
      name: intent,
      slots: {},
    },

  }, session, response, context);
};

StateMachineSkill.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onSessionEnded requestId: ${sessionEndedRequest.requestId}, sessionId: ${
      session.sessionId}`);
  }
  const handler = _this._StateMachine.onSessionEnd;
  if (handler) handler(new Request(sessionEndedRequest, session));
};

StateMachineSkill.prototype.eventHandlers.onIntent = function (request, session,
  response, context) {
  const _this = this;
  request = new Request(request, session);
  if (_this._config.verbose) console.log(`Got intent ${request.intent.name}`);

  const fromState = session.new ? 'entry' : session.attributes.state || 'entry';
  const stateMachine = _this._StateMachine(fromState);

  if (stateMachine.onRequestStart) stateMachine.onRequestStart(request);

  return stateMachine.transition(request, context)
      .then(trans => transitionEndingInterceptor.call(_this, trans, stateMachine, request))
      .then((trans) => {
        if (_this._config.verbose) {
          console.log(`Yielding to [${trans.to ? trans.to.name : 'nowhere'}]`);
        }
        if (trans.to) response._session.attributes.state = trans.to.name; else trans.reply.end();
        trans.reply.write(response);
      })
      .catch(respondError.call(_this, stateMachine, request, response));
};

StateMachineSkill.prototype.eventHandlers.onPlaybackStarted = function (playBackRequest, response) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onPlaybackStarted requestId: ${
    playBackRequest.request.requestId}`);
  }

  Promise.resolve(playBackRequest)
    .then(() => _this._StateMachine.onPlaybackStart(playBackRequest))
    .then((reply) => {
      if (reply) {
        reply.write(response);
      } else {
        new Reply().write(response);
      }
    })
    .catch((err) => {
      if (_this._config.verbose) console.log(`onPlaybackStarted err: ${err}`);
      new Reply().write(response);
    });
};

StateMachineSkill.prototype.eventHandlers.onPlaybackFinished = function (playBackRequest,
  response) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onPlaybackFinished requestId: ${
      playBackRequest.request.requestId}`);
  }

  Promise.resolve(playBackRequest)
      .then(() => _this._StateMachine.onPlaybackFinish(playBackRequest))
      .then((reply) => {
        if (reply) {
          reply.write(response);
        } else {
          new Reply().write(response);
        }
      })
      .catch((err) => {
        if (_this._config.verbose) console.log(`onPlaybackFinished err: ${err}`);
        new Reply().write(response);
      });
};

StateMachineSkill.prototype.eventHandlers.onPlaybackNearlyFinished = function (playBackRequest,
  response) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onPlaybackNearlyFinished requestId: ${
      playBackRequest.request.requestId}`);
  }

  Promise.resolve(playBackRequest)
      .then(() => _this._StateMachine.onPlaybackNearlyFinish(playBackRequest))
      .then((reply) => {
        if (reply) {
          reply.write(response);
        } else {
          new Reply().write(response);
        }
      })
      .catch((err) => {
        if (_this._config.verbose) console.log(`onPlaybackNearlyFinished err: ${err}`);
        new Reply().write(response);
      });
};

StateMachineSkill.prototype.eventHandlers.onPlaybackStopped = function (playBackRequest, response) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onPlaybackStopped requestId: ${
    playBackRequest.request.requestId}`);
  }

  Promise.resolve(playBackRequest)
    .then(() => _this._StateMachine.onPlaybackStop(playBackRequest))
    .then((reply) => {
      if (reply) {
        reply.write(response);
      } else {
        new Reply().write(response);
      }
    })
    .catch((err) => {
      if (_this._config.verbose) console.log(`onPlaybackStopped err: ${err}`);
      new Reply().write(response);
    });
};

StateMachineSkill.prototype.eventHandlers.onPlaybackFailed = function (playBackRequest, response) {
  const _this = this;
  if (_this._config.verbose) {
    console.log(`onPlaybackFailed requestId: ${
    playBackRequest.request.requestId}`);
  }

  Promise.resolve(playBackRequest)
    .then(() => _this._StateMachine.onPlaybackFail(playBackRequest))
    .then((reply) => {
      if (reply) {
        reply.write(response);
      } else {
        new Reply().write(response);
      }
    })
    .catch((err) => {
      if (_this._config.verbose) console.log(`onPlaybackFailed err: ${err}`);
      new Reply().write(response);
    });
};

let transitionEndingInterceptor = function (trans, stateMachine, request) {
  if (!stateMachine.onTransition) return trans;
  return Promise.try(() => stateMachine.onTransition(trans, request)).then(back => back || trans);
};

const respondAuthFailure = function (response) {
  const _this = this;
  const errorMsg = _this._StateMachine.onAuthError();
  errorMsg.write(response);
};

const respondBadResponse = function (stateMachine, request, response) {
  const _this = this;

  Promise.try(() => _this._StateMachine.onBadResponse(request)).then((reply) => {
    if (reply) {
      if (_this._config.verbose) { console.log('Got an error response, and it was handled by a custom handler'); }
      reply.write(response);
    } else {
      respondError(stateMachine, request, response)();
    }
  }).catch(respondError(stateMachine, request, response));
};

let respondError = function (stateMachine, request, response) {
  const _this = this;
  return function (error) {
    if (error && (error.statusCode == 401 || error == ERRORS.AUTHORIZATION)) {
      return respondAuthFailure.call(_this, response);
    }
    console.error('Respond with error',
      error ? error.stack || error.statusCode || error : 'unknown');
    if (error && error == ERRORS.BAD_RESPONSE) { return respondBadResponse.call(_this, stateMachine, request, response); }
    Promise.try(() => stateMachine.onError(request, error)).then((errorMsg) => {
      // Can give back a transition or a message. Even if it's a transition,
      // we ignore it and just say the message
      if (errorMsg.message) errorMsg = new Reply(errorMsg.message);
      errorMsg.write(response);
    }).catch(() => {
      new Reply({ tell: 'An unrecoverable error occurred.' }).write(response);
    });
  };
};

const replyWith = module.exports.replyWith = function (msgPath, state, request, data) {
  const _this = this;
  if (verbose) console.log(`Move to state [${state}] and say ${msgPath}`);
  return renderMessage(msgPath, data).then((msg) => {
    // For AMAZON.RepeatIntent
    let reply = null;
    if (msg && msg.ask) reply = { msgPath, state };
    return {
      message: msg,
      to: state,
      session: {
        data: data ? data.serialize() : request.session.attributes.data,
        startTimestamp: request.session.attributes.startTimestamp,
        reply,
      },
    };
  });
};

const replyWithAudioDirectives = module.exports.replyWithAudioDirectives = function (msgPath, state,
  request, data, directives) {
  const _this = this;
  if (verbose) console.log(`Move to state [${state}] and say ${msgPath}`);
  return renderMessage(msgPath, data).then((msg) => {
      // For AMAZON.RepeatIntent
    let reply = null;
    if (msg && msg.ask) reply = { msgPath, state };
    return {
      message: msg,
      directives,
      to: state,
      session: {
        data: data ? data.serialize() : request.session.attributes.data,
        startTimestamp: request.session.attributes.startTimestamp,
        reply,
      },
    };
  });
};

function renderMessage(msgPath, data) {
  if (!msgPath) return Promise.resolve(null);
  return messageRenderer(msgPath, data);
}

function SimpleHelpMessage(msgPath, analyticEvent, toState) {
  return {
    enter: function enter(request) {
      // var analytics = universalAnalytics(config.googleAnalytics.trackingCode,
      //  request.session.user.userId,
      //  { strictCidFormat: false });
      analytics(request).event('Help Flow', analyticEvent).send();
      return replyWith(msgPath, toState || 'die', request, null);
    },
  };
}

let analytics = module.exports.analytics = function (request) {
  const _this = this;
  return universalAnalytics(_this._config.googleAnalytics.trackingCode,
    request.session.user.userId,
    { strictCidFormat: false });
};
