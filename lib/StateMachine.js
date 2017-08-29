'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const errors = require('./Errors');
const debug = require('debug')('voxa');

class StateMachine {
  constructor(currentState, config) {
    StateMachine.validateConfig(config);
    this.states = config.states;
    this.currentState = this.states[currentState];
    this.onBeforeStateChangedCallbacks = config.onBeforeStateChanged || [];
    this.onAfterStateChangeCallbacks = config.onAfterStateChanged || [];
    this.onUnhandledStateCallbacks = config.onUnhandledState || [];

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

  checkOnUnhandledState(alexaEvent, transition) {
    if (!transition) {
      debug('Running onUnhandledStateCallbacks');
      return Promise
        .mapSeries(this.onUnhandledStateCallbacks, fn => fn(alexaEvent, this.currentState.name))
        .then(_.last)
        .then((onUnhandledStateTransition) => {
          if (!onUnhandledStateTransition) {
            throw new errors.UnhandledState(alexaEvent,
                                            onUnhandledStateTransition,
                                            this.currentState.name);
          }
          return onUnhandledStateTransition;
        });
    }

    return transition;
  }

  checkForEntryFallback(alexaEvent, transition) {
    if (!transition && this.currentState.name !== 'entry') {
      // If no response try falling back to entry
      debug(`No reply for ${alexaEvent.intent.name} in [${this.currentState.name}]. Trying [entry].`);
      this.currentState = this.states.entry;
      return this.runCurrentState(alexaEvent);
    }

    return transition;
  }

  onAfterStateChanged(alexaEvent, reply, transition) {
    if (transition && !transition.to) {
      _.merge(transition, { to: 'die' });
    }
    const onAfterStateChanged = this.onAfterStateChangeCallbacks;
    debug(`${this.currentState.name} transition resulted in %j`, transition);
    debug('Running onAfterStateChangeCallbacks');
    return Promise.mapSeries(onAfterStateChanged, fn => fn(alexaEvent, reply, transition))
      .then(() => transition);
  }

  transition(alexaEvent, reply) {
    return Promise.try(() => runTransition.call(this));


    function runTransition() {
      const onBeforeState = this.onBeforeStateChangedCallbacks;
      return Promise.mapSeries(onBeforeState, fn => fn(alexaEvent, reply, this.currentState))
        .then(() => this.runCurrentState(alexaEvent))
        .then(transition => this.checkForEntryFallback(alexaEvent, transition))
        .then(transition => this.checkOnUnhandledState(alexaEvent, transition))
        .then(transition => this.onAfterStateChanged(alexaEvent, reply, transition))
        .then((transition) => {
          let to;
          if (transition.to) {
            if (!this.states[transition.to]) {
              throw new errors.UnknownState(transition.to);
            }
            to = this.states[transition.to];
            transition.to = to;
            reply.append(transition.message);
          } else {
            to = { name: 'die' };
          }


          if (reply.isYielding() || !transition.to || transition.to.isTerminal) {
            const result = { to };
            if (_.isString(transition.reply) || _.isArray(transition.reply)) {
              result.reply = transition.reply;
            }
            return result;
          }

          this.currentState = this.states[to.name];
          return runTransition.call(this);
        });
    }
  }

  runCurrentState(alexaEvent) {
    if (this.currentState.enter) {
      debug(`Running ${this.currentState.name} enter function`);
      return Promise.try(() => this.currentState.enter(alexaEvent));
    }

    debug(`Running simpleTransition for ${this.currentState.name}`);
    const fromState = this.currentState;
    const destName = fromState.to[alexaEvent.intent.name];

    if (!destName) {
      return null;
    }

    const destObj = this.states[destName];
    if (!destObj) {
      throw new errors.UnknownState(destName);
    }

    return { to: destName };
  }
}

module.exports = StateMachine;
