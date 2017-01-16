'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const Reply = require('alexa-helpers').reply;

class StateMachine {
  constructor(statesDefinition, currentState, onBeforeStateChangedCallbacks, messageRenderer) {
    StateMachine.validateStatesDefinition(statesDefinition);
    this.states = statesDefinition;
    this.currentState = this.states[currentState];
    this.onBeforeStateChangedCallbacks = onBeforeStateChangedCallbacks || [];
    this.messageRenderer = messageRenderer;
  }

  static validateStatesDefinition(statesDefinition) {
    if (!_.has(statesDefinition, 'entry')) {
      throw new Error('State machine must have a `entry` state.');
    }
  }

  replyWith(msgPath, state, request) {
    return this.renderMessage(msgPath, request.model)
      .then((msg) => {
        // For AMAZON.RepeatIntent
        let reply = null;
        if (msg && msg.ask) reply = { msgPath, state };
        return {
          message: msg,
          to: state,
          session: {
            data: request.model.serialize(),
            startTimestamp: request.session.attributes.startTimestamp,
            reply,
          },
        };
      });
  }

  renderMessage(msgPath, data) {
    if (!msgPath) return Promise.resolve(null);
    return this.messageRenderer(msgPath, data);
  }

  transition(request, response) {
    const reply = new Reply();
    const path = [];
    return runTransition.call(this);

    function runTransition() {
      return Promise.mapSeries(this.onBeforeStateChangedCallbacks, fn => fn(request, response))
        .then(() => {
          if (this.currentState.enter) {
            return Promise.resolve(this.currentState.enter(request, response));
          }

          if (this.currentState.to[request.intent.name]) {
            return { to: this.currentState.to[request.intent.name] };
          }

          throw new Error(`Unsupported intent for state ${request.intent.name}`);
        })
        .then((result) => {
          console.log(result)
          if (result && result.to) {
            this.currentState = this.states[result.to];
            return runTransition.call(this);
          }

          if (!result) {
            // If no response try falling back to entry
            this.currentState = this.states.entry;
            return runTransition.call(this);
          }

          return this.replyWith(result.reply, result.to, request)
            .then((transitionResult) => {
              if (!transitionResult) throw new Error('Bad Response');
              if (transitionResult.to) {
                to = transitionResult.to = this.states(transitioResultn.to);
                path.unshift(to);

                if (transitionResult.message) {
                  transitionResult.message.directives = transitionResult.directives;
                } else {
                  transitionResult.message = { directives: transitionResult.directives };
                }

                reply.append(transitionResult.message);
              }

              if (!request.session) {
                request.session = {};
              }

              request.session.attributes = transitionResult.session || request.session.attributes;

              if (!request.session.attributes) {
                request.session.attributes = {};
              }

              if (reply.isYielding() || !transitionResult.to || transitionResult.to.isTerminal) {
                return { reply: reply, path: path, to: path[0] };
              }

              this.currentState = this.states[to];
              return runTransition();
            });
        });
    }
  }
}

module.exports = StateMachine;
