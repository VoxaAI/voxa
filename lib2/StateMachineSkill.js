'use strict';

const Promise = require('bluebird');
const AlexaSkill = require('./AlexaSkill');
const StateMachine = require('./StateMachine');
const MessageRenderer = require('alexa-helpers').messageRenderer;
const _ = require('lodash');
const BadResponse = require('./Errors').BadResponse;
const Reply = require('./Reply');
const debug = require('debug')('alexa-statemachine');

class StateMachineSkill extends AlexaSkill {
  constructor(appId, config) {
    super(appId);
    StateMachineSkill.validateConfig(config);
    this.states = {};
    this.config = config;

    this.eventHandlers.onBeforeStateChanged = [];
    this.eventHandlers.onAfterStateChanged = [];
    this.eventHandlers.onBeforeReplySent = [];
    // Sent whenever there's an unhandled error in the onIntent code
    this.eventHandlers.onError = [];

    // run the intent request through the stateMachine
    this.onIntent((request, reply) => {
      const fromState = request.session.new ? 'entry' : request.session.attributes.state || 'entry';
      const stateMachine = new StateMachine(fromState, {
        states: this.states,
        onBeforeStateChanged: this.eventHandlers.onBeforeStateChanged,
        onAfterStateChanged: this.eventHandlers.onAfterStateChanged,
      });

      return stateMachine.transition(request, reply)
        .then((trans) => {
          if (trans.to) {
            reply.session.attributes.state = trans.to.name;
          } else {
            reply.end();
          }

          let promise = Promise.resolve(null);
          if (trans.to.isTerminal) {
            promise = this.handleOnSessionEnded(request, reply);
          }

          return promise
            .then(() => {
              const renderedReply = reply.write();
              return Promise.mapSeries(this.eventHandlers.onBeforeReplySent, fn => fn(request, reply))
                .then(() => renderedReply);
            });
        })
        .catch(BadResponse, error => this.handleOnBadResponseErrors(request, reply, error))
        .catch(error => this.handleErrors(request, reply, error));
    });

    // i always want the model to be available in the request
    this.onRequestStarted((request) => {
      request.model = config.Model.fromRequest(request);
    });

    // we treat onLaunch as an intentRequest for the openIntent
    this.onLaunch((request, reply) => {
      const intent = this.config.openIntent;
      _.set(request, 'intent.name', intent);
      _.set(request, 'intent.slots', {});

      return this.requestHandlers.IntentRequest(request, reply);
    });

    // my default is to render with the message renderer on state machine
    // transitions, doing it like this means the state machine doesn't need to
    // know about rendering or anything like that
    this.onAfterStateChanged((request, reply, result) => this.render(request, reply, result));

    // default onBadResponse action is to just defer to the general error handler
    this.onBadResponse((request, reply, error) => this.handleErrors(request, reply, error));
    this.onError((request, reply, error) => new Reply({ tell: 'An unrecoverable error occurred.' }).write());
  }

  static validateConfig(config) {
    if (!config.Model) {
      throw new Error('Config should include a model');
    }

    if (!config.Model.fromRequest) {
      throw new Error('Model should have a fromRequest method');
    }

    if (!config.Model.serialize && !(config.Model.prototype && config.Model.prototype.serialize)) {
      throw new Error('Model should have a serialize method');
    }

    if (!config.variables) {
      throw new Error('Config should include variables');
    }

    if (!config.responses) {
      throw new Error('Config should include responses');
    }

    if (!config.openIntent) {
      throw new Error('Config should include openIntent');
    }
  }

  render(request, reply, result) {
    if (!result || !result.reply) {
      return Promise.resolve(result);
    }

    const messageRenderer = MessageRenderer(this.config.responses, this.config.variables);

    return messageRenderer(result.reply, request.model)
      .then((message) => {
        let msgReply = null;
        if (message) {
          if (message.ask) {
            msgReply = { msgPath: result.reply, state: result.to };
          }

          message.directives = result.directives;
        }

        return _.merge(result, {
          message,
          session: {
            data: request.model.serialize(),
            startTimestamp: request.session.attributes.startTimestamp,
            reply: msgReply,
          },
        });
      });
  }

  onState(stateName, state) {
    if (_.isFunction(state)) {
      this.states[stateName] = {
        enter: state,
      };
    } else {
      this.states[stateName] = state;
    }

    this.states[stateName].name = stateName;
  }

  onBeforeStateChanged(callback) {
    this.eventHandlers.onBeforeStateChanged.push(callback);
  }

  onBeforeReplySent(callback) {
    this.eventHandlers.onBeforeReplySent.push(callback);
  }

  onAfterStateChanged(callback) {
    this.eventHandlers.onAfterStateChanged.unshift(callback);
  }

  onError(callback) {
    this.eventHandlers.onError.unshift(callback);
  }

}

module.exports = StateMachineSkill;
