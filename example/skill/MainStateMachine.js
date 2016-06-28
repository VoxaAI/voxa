'use strict';

var StateMachine = require('./StateMachine.js')
  , StateMachineSkill = require('./StateMachineSkill.js')
  , config = require('../config')
  , Reply = require('./reply.js')
  , _ = require('lodash')
  , PartialOrder = require('../services/PartialOrder.js')
  , responses = require('./responses.js')
  , messageRenderer = require('./message-renderer.js')(responses, require('./variables.js'))
  , verbose = config.verbose
  , Promise = require('bluebird')
  , universalAnalytics = require('universal-analytics')
  , OAuthHelpers = require('../services/oauth-helpers.js')
  , oauthhelper = OAuthHelpers(config.alexa.auth);

;


module.exports = StateMachine({

  onTransition: function onTransition(trans, request) {
    // Remember the last re-prompt. We're going to play it back in the case of a bad response
    if (trans.reply) {
      var reprompt = trans.reply.msg.reprompt;
      if (reprompt) {
        request.session.attributes.reprompt = reprompt;
        return;
      }
    }
    request.session.attributes.reprompt = null;
  },
  onBadResponse: function onBadResponse(request) {
    var reply = new Reply();
    var reprompt = request.session.attributes.reprompt;
    // The user said something unexpected, replay the last reprompt
    if (reprompt) {
      reply.append(_.at(responses, 'BadInput.RepeatLastAskReprompt')[0]);
      reply.append({ ask: reprompt });
    } else {
      reply.append(_.at(responses, 'Errors.ErrorNonPlannedAtLaunch')[0]);
    }

    return reply;
  },
  onAuthError: function onAuthError() {
    return new Reply(_.at(responses, 'Errors.NotConnectedToAccount')[0]);
  },
  onError: function onError(request, error) {
    var _this = this;

    var self = this;
    return this.Access(request).then(function (user) {
      return PartialOrder.fromRequest(user, request);
    }).then(function (po) {
      if(error) po.analytics.exception(error.stack || error.body || error.data || error.message || error).send();
      if (_this.isInState('launch', 'entry')) return replyWith('Errors.ErrorAtLaunch', 'die', request, po);
      if (_this.isInState('confirm', 'confirm-query', 'place')) return replyWith('Errors.ErrorAtOrder', 'die', request, po);
      return new Reply(_.at(responses, 'Errors.ErrorGeneral')[0]);
    }).catch(function (err) {
      if(verbose) console.error('Error rendering error', err.stack);
      analytics(request).exception(err.stack || err.body || err.data || err.message || err, true).send();
      return new Reply(_.at(responses, 'Errors.ErrorGeneral')[0]);
    });
  },
  onSessionStart: function onSessionStart(request) {
    request.session.attributes.startTimestamp = +new Date();
    console.log('Session start');
    analytics(request).event('Main Flow', 'Session Start', {sc: 'start'}).send();
  },
  onSessionEnd: function onSessionEnd(request) {
      var start = request.session.attributes.startTimestamp,
        elapsed = +new Date() - start
    ;
    analytics(request).event('Main Flow', 'Session End', {sc: 'end'}).send();
    if (start) {
      analytics(request).timing('Main Flow', 'Session Duration', elapsed).send();
      if (verbose) console.log('Session Duration', elapsed); // We used to log this to GA timing API, but they didn't want that anymore, now it's just an FYI
    }
  }

});



function replyWith(msgPath, state, request, partialOrder) {
  if (verbose) console.log('Move to state [' + state + '] and say ' + msgPath);
  return renderMessage(msgPath, partialOrder).then(function (msg) {
    // For AMAZON.RepeatIntent
    var reply = null;
    if (msg && msg.ask) reply = { msgPath: msgPath, state: state };
    return {
      message: msg,
      to: state,
      session: {
        partialOrder: partialOrder ? partialOrder.serialize() : request.session.attributes.partialOrder,
        startTimestamp: request.session.attributes.startTimestamp,
        reply: reply
      }
    };
  });
}

function renderMessage(msgPath, partialOrder) {
  if (!msgPath) return Promise.resolve(null);
  return messageRenderer(msgPath, partialOrder);
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
