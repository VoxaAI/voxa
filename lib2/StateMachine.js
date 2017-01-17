'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const Reply = require('alexa-helpers').reply;

const ERRORS = module.exports.ERRORS = {
  AUTHORIZATION: 'Authorization Error',
  BAD_RESPONSE: 'Bad Response Error',
};

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

  replyWith(result, request) {
    return this.renderMessage(result.reply, request.model)
      .then((msg) => {
        // For AMAZON.RepeatIntent
        let reply = null;
        if (msg && msg.ask) reply = { msgPath: result.reply, state: result.to };
        return {
          message: msg,
          directives: result.directives,
          to: result.to,
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
        .then(result => this.replyWith(result, request))
        .then((replyResult) => {
          let to;
          if (!replyResult) throw new Error(ERRORS.BAD_RESPONSE);
          if (replyResult.to) {
            to = replyResult.to = this.states[replyResult.to];
            path.unshift(to);

            if (replyResult.message) {
              replyResult.message.directives = replyResult.directives;
            } else {
              replyResult.message = { directives: replyResult.directives };
            }

            reply.append(replyResult.message);
          }

          request.session.attributes = replyResult.session || request.session.attributes || {};

          if (reply.isYielding() || !replyResult.to || replyResult.to.isTerminal) {
            return { reply, path, to: path[0] };
          }

          this.currentState = this.states[to.name];
          return runTransition.call(this);
        });
    }
  }
}

module.exports = StateMachine;
