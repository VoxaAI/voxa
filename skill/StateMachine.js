"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _ = require('lodash'),
    Promise = require('bluebird'),
    Reply = require('./reply.js'),
    verbose = require('../config').verbose,
    StateMachineSkill = require('./StateMachineSkill.js');

module.exports = function (def) {
  annotateStateNames(def.states);

  var klass = function klass(state) {
    if (_.isString(state)) state = def.states[state];
    if (!state) throw new Error('Unknown state ' + state);

    var instance = {
      transition: transition,
      getState: getState,
      isInState: isInState
    };
    instance.__proto__ = def;
    return instance;

    function transition(request) {
      var path = [],
          reply = new Reply();
      return nextTransition(state);

      function nextTransition(state) {
        return Promise.try(function () {
          return state.enter ? state.enter.call(instance, request) : simpleTransition(state);
        }).then(function (transition) {
          if (!transition) {
            //If no response try falling back to entry
            if (verbose) console.log('No reply for ' + request.intent.name + ' in [' + state.name + ']. Trying [entry].');
            var entryState = instance.getState('entry');
            return Promise.try(function () {
              return entryState.enter ? entryState.enter.call(instance, request) : simpleTransition(entryState);
            })
          }
          return transition;
        }).then(function (transition) {
          if (!transition) throw StateMachineSkill.ERRORS.BAD_RESPONSE;
          if (transition.to) {
            var to = transition.to = getState(transition.to);
            path.unshift(to);
            reply.append(transition.message);
          }
          request.session.attributes = transition.session || request.session.attributes;
          if (reply.isYielding() || !transition.to || transition.to.isTerminal) return { reply: reply, path: path, to: path[0] };
          return nextTransition(to);
        });

        function simpleTransition(state) {
          var fromState = state,
              destName = state.to[request.intent.name];
          if (!destName) return null;
          var destObj = getState(destName);
          if (!destObj) throw 'Unknown state ' + destName;
          return {
            to: destObj
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
    return state.name = name;
  });
}
