'use strict';

const Promise = require('bluebird');
const AlexaSkill = require('./AlexaSkill');
const StateMachine = require('./StateMachine');
const MessageRenderer = require('alexa-helpers').messageRenderer;
const _ = require('lodash');
const BadResponse = require('./Errors').BadResponse;

class StateMachineSkill extends AlexaSkill {
  constructor(appId, config) {
    super(appId);
    StateMachineSkill.validateConfig(config);
    this.states = {};
    this.messageRenderer = MessageRenderer(config.responses, config.variables);
    this.openIntent = config.openIntent;

    this.eventHandlers.onIntent = []; // we override what the base AlexaSkill had
    this.eventHandlers.onBeforeStateChanged = [];
    this.eventHandlers.onAfterStateChanged = [];
    this.eventHandlers.onBeforeReplySent = [];

    // run the intent request through the stateMachine
    this.onIntent((request, response) => {
      const fromState = request.session.new ? 'entry' : request.session.attributes.state || 'entry';
      const stateMachine = new StateMachine(fromState, {
        states: this.states,
        onBeforeStateChanged: this.eventHandlers.onBeforeStateChanged,
        onAfterStateChanged: this.eventHandlers.onAfterStateChanged,
      });

      return stateMachine.transition(request, response)
        .then((trans) => {
          if (trans.to) {
            response.session.attributes.state = trans.to.name;
          } else {
            trans.reply.end();
          }

          let promise = Promise.resolve(null);
          if (trans.to.isTerminal) {
            promise = this.handleOnSessionEnded(request, response);
          }

          return promise
            .then(() => {
              const reply = trans.reply.write(response);
              return Promise.mapSeries(
                this.eventHandlers.onBeforeReplySent, fn => fn(request, response, reply))
                .then(() => reply);
            });
        })
        .catch(BadResponse, error => this.handleOnBadResponseErrors(request, response, error))
        .catch(error => this.handleErrors(request, response, error));
    });

    // i always want the model to be available in the request
    this.onRequestStarted((request) => {
      request.model = config.Model.fromRequest(request);
    });

    // we treat onLaunch as an intentRequest for the openIntent
    this.onLaunch((request, response) => {
      const intent = this.openIntent;
      _.set(request, 'intent.name', intent);
      _.set(request, 'intent.slots', {});

      return this.requestHandlers.IntentRequest(request, response);
    });

    // my default is to render with the message renderer on state machine
    // transitions, doing it like this means the state machine doesn't need to
    // know about rendering or anything like that
    this.onAfterStateChanged((request, response, result) => {
      if (!result || !result.reply) {
        return Promise.resolve(result);
      }

      return this.messageRenderer(result.reply, request.model)
        .then((message) => {
          // For AMAZON.RepeatIntent
          let reply = null;
          if (message) {
            if (message.ask) {
              reply = { msgPath: result.reply, state: result.to };
            }

            message.directives = result.directives;
          }

          return _.merge(result, {
            message,
            session: {
              data: request.model.serialize(),
              startTimestamp: request.session.attributes.startTimestamp,
              reply,
            },
          });
        });
    });
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
    this.eventHandlers.onAfterStateChanged.push(callback);
  }

}

module.exports = StateMachineSkill;
