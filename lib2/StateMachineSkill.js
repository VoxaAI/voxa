'use strict';

const AlexaSkill = require('./AlexaSkill');
const StateMachine = require('./StateMachine');
const MessageRenderer = require('alexa-helpers').messageRenderer;
const _ = require('lodash');

class StateMachineSkill extends AlexaSkill {
  constructor(appId, config) {
    super(appId);
    StateMachineSkill.validateConfig(config);
    this.states = {};
    this.messageRenderer = MessageRenderer(config.responses, config.variables);
    this.openIntent = config.openIntent;

    this.eventHandlers.onIntent = [];
    this.eventHandlers.onBeforeStateChanged = [];
    this.onIntent((request, response) => {
      const fromState = request.session.new ? 'entry' : request.session.attributes.state || 'entry';
      const stateMachine = new StateMachine(
        this.states,
        fromState,
        this.eventHandlers.onBeforeStateChanged,
        this.messageRenderer);

      return stateMachine.transition(request, response)
        .then((trans) => {
          if (trans.to) {
            response.session.attributes.state = trans.to.name;
          } else {
            trans.reply.end();
          }

          return trans.reply.write(response);
        });
    });

    this.onRequestStarted((request) => {
      request.model = config.Model.fromRequest(request);
    });

    this.onLaunch((request, response) => {
      const intent = this.openIntent;
      _.set(request, 'intent.name', intent);
      _.set(request, 'intent.slots', {});

      return this.requestHandlers.IntentRequest(request, response);
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

}

module.exports = StateMachineSkill;
