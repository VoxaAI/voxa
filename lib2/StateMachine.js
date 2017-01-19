'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const Reply = require('./Reply');

const ERRORS = module.exports.ERRORS = {
  AUTHORIZATION: 'Authorization Error',
  BAD_RESPONSE: 'Bad Response Error',
};

class StateMachine {
  constructor(currentState, config) {
    StateMachine.validateConfig(config);
    this.states = config.states;
    this.currentState = this.states[currentState];
    this.onBeforeStateChangedCallbacks = config.onBeforeStateChanged || [];
    this.onAfterStateChangeCallbacks = config.onAfterStateChanged || [];

    // If die event does not exist auto complete it.
    if (!_.has(this.states, 'die')) {
      _.assign(this.states, {
        die: { isTerminal: true },
      });
    }
  }

  static validateConfig(config) {
    if (!_.has(config, 'states')) {
      throw new Error('State machine must have a `states` definition.');
    }
    if (!_.has(config.states, 'entry')) {
      throw new Error('State machine must have a `entry` state.');
    }
  }

  transition(request, response) {
    const reply = new Reply();
    return runTransition.call(this);

    function runTransition() {
      return Promise.mapSeries(this.onBeforeStateChangedCallbacks, fn => fn(request, response))
        .then(() => {
          if (this.currentState.to && this.currentState.to[request.intent.name]) {
            return { to: this.currentState.to[request.intent.name] };
          }

          if (this.currentState.enter) {
            return Promise.resolve(this.currentState.enter(request, response));
          }

          throw new Error(`Unsupported intent for state ${request.intent.name}`);
        })
        .then(result => Promise.mapSeries(this.onAfterStateChangeCallbacks, fn => fn(request, response, result)).then(() => result))
        .then((result) => {
          let to;
          if (!result) throw new Error(ERRORS.BAD_RESPONSE);
          if (result.to) {
            to = result.to = this.states[result.to];
            reply.append(result.message);
          }

          request.session.attributes = result.session || request.session.attributes || {};

          if (reply.isYielding() || !result.to || result.to.isTerminal) {
            return { reply, to };
          }

          this.currentState = this.states[to.name];
          return runTransition.call(this);
        });
    }
  }
}

module.exports = StateMachine;
