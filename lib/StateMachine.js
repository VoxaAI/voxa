/* jshint esnext: true */
/* jshint proto: true */
'use strict';

var _typeof;
if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
  _typeof = function (obj) {
    return typeof obj;
  };
} else {
  _typeof = function (obj) {
    return (obj && typeof Symbol === 'function' && obj.constructor === Symbol) ?
      'symbol' : typeof obj;
  };
}

var _ = require('lodash'),
    Promise = require('bluebird'),
    Reply = require('alexa-helpers').reply,
    ERRORS = require('./StateMachineSkill').ERRORS,
    replyWith = require('./StateMachineSkill').replyWith;

module.exports = function (def, config) {
  var verbose = config ? config.verbose || true : true;
  validateDef(def);
  annotateStateNames(def.states);

  var klass = function klass(stateName) {
    var state;
    if (_.isString(stateName)) state = def.states[stateName];
    if (!state) throw new Error('Unknown state ' + stateName);

    var instance = {
      transition: transition,
      getState: getState,
      isInState: isInState,
    };
    instance.__proto__ = def;
    return instance;

    function transition(request, context) {
      var path = [],
          reply = new Reply();
      return nextTransition(state, context);

      function nextTransition(state, context) {
        return Promise.try(function () {
          return state.enter ? state.enter.call(instance, request, context) :
                  simpleTransition(state);
        }).then(function (transition) {
          if (!transition) {
            //If no response try falling back to entry
            if (verbose) console.log('No reply for ' + request.intent.name + ' in [' +
              state.name + ']. Trying [entry].');
            var entryState = instance.getState('entry');
            return Promise.try(function () {
              return entryState.enter ?
                entryState.enter.call(instance, request, context) : simpleTransition(entryState);
            });
          }

          return transition;
        }).then(function (transition) {

          var to;
          if (!transition) throw ERRORS.BAD_RESPONSE;
          if (transition.to) {
            to = transition.to = getState(transition.to);
            path.unshift(to);

            if (transition.message && transition.directives) {
              transition.message.directives = transition.directives;
            }

            reply.append(transition.message);
          }

          if (!request.session) {
            request.session = {};
          }

          request.session.attributes = transition.session || request.session.attributes;

          if (!request.session.attributes) {
            request.session.attributes = {};
          }

          if (reply.isYielding() || !transition.to || transition.to.isTerminal)
            return { reply: reply, path: path, to: path[0] };
          return nextTransition(to, context);
        });

        function simpleTransition(state) {
          var fromState = state,
              destName = state.to[request.intent.name];
          if (!destName) return null;
          var destObj = getState(destName);
          if (!destObj) throw 'Unknown state ' + destName;
          return {
            to: destObj,
          };
        }
      }
    }

    function isInState() {
      var currentStateName = _.isString(state) ? state : state.name;
      return _.some(arguments, function (consider) {
        return consider.name || consider == currentStateName;
      });
    }
  };

  klass.openIntent = def.openIntent;
  klass.onAuthError = def.onAuthError;
  klass.onBadResponse = def.onBadResponse;
  klass.onTransition = def.onTransition;
  klass.onSessionStart = def.onSessionStart;
  klass.onSessionEnd = def.onSessionEnd;
  klass.onPlaybackStart = def.onPlaybackStart;
  klass.onPlaybackFinish = def.onPlaybackFinish;
  klass.onPlaybackNearlyFinish = def.onPlaybackNearlyFinish;
  klass.onPlaybackStop = def.onPlaybackStop;
  klass.onPlaybackFail = def.onPlaybackFail;
  klass.onRequestStart = def.onRequestStart;
  klass.getState = getState;
  return klass;

  function getState(state) {
    if (_.isString(state)) {
      var obj = def.states[state];
      if (!obj) throw Error('Could not find state ' + state);
      return obj;
    } else if (!state) {
      throw Error('Could not find state', state);
    }

    return state;
  }
};

function annotateStateNames(states) {
  _.forEach(states, function (state, name) {
    state.name = name;
  });
}

function validateDef(def) {
  if (!_.has(def.states, 'entry')) {
    throw new Error('State machine must have a `entry` state.');
  }

  // If die event does not exist auto complete it.
  if (!_.has(def.states, 'die')) {
    _.assign(def.states, {
      die: { isTerminal: true },
    });
  }
}
