'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const errors = require('./Errors');
const debug = require('debug')('alexa-statemachine');

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
        die: { isTerminal: true, name: 'die' },
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

  transition(request, reply) {
    if (!request.flow) {
      request.flow = [];
    }

    return runTransition.call(this);

    function runTransition() {
      return Promise.mapSeries(this.onBeforeStateChangedCallbacks, fn => fn(request, reply))
        .then(() => this.runCurrentState(request))
        .then((result) => {
          if (!result && this.currentState.name !== 'entry') {
            // If no response try falling back to entry
            debug(`No reply for ${request.intent.name} in [${this.currentState.name}]. Trying [entry].`);
            this.currentState = this.states.entry;
            return this.runCurrentState(request);
          }

          if (result && !_.isObject(result)) {
            return _.merge(result, { to: 'die' });
          }

          return result;
        })
        .then((result) => {
          debug('Running onAfterStateChangeCallbacks');
          return Promise.mapSeries(this.onAfterStateChangeCallbacks,
            fn => fn(request, reply, result))
            .then(() => result);
        })
        .then((result) => {
          debug(`${this.currentState.name} transition resulted in %s`, JSON.stringify(result));
          let to;
          if (!result) throw new errors.BadResponse(result, this.currentState.name);
          if (result.to) {
            to = result.to = this.states[result.to];
            reply.append(result.message);
          }

          if (reply.isYielding() || !result.to || result.to.isTerminal) {
            request.flow.push(to.name);
            return { to };
          }

          this.currentState = this.states[to.name];
          return runTransition.call(this);
        });
    }
  }

  runCurrentState(request) {
    request.flow.push(this.currentState.name);
    if (this.currentState.enter) {
      debug(`Running ${this.currentState.name} enter function`);
      return Promise.try(() => this.currentState.enter(request));
    }

    debug(`Running simpleTransition for ${this.currentState.name}`);
    const fromState = this.currentState;
    const destName = fromState.to[request.intent.name];

    if (!destName) {
      throw new errors.UnsupportedIntent(this.currentState.name, request.intent.name);
    }

    const destObj = this.states[destName];
    if (!destObj) {
      throw new errors.UnknownState(destName);
    }

    return { to: destName };
  }
}

module.exports = StateMachine;
