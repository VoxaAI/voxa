'use strict';

const Promise = require('bluebird');
const AlexaSkill = require('./AlexaSkill');
const StateMachine = require('./StateMachine');
const _ = require('lodash');
const DefaultRenderer = require('./renderers/DefaultRenderer');
const Reply = require('../lib/Reply');
const debug = require('debug')('alexa-statemachine');
const Model = require('./Model');

class StateMachineSkill extends AlexaSkill {
  constructor(appId, config) {
    super(appId, config);
    this.states = {};
    this.config = _.assign({
      RenderClass: DefaultRenderer,
      Model,
    }, this.config);
    StateMachineSkill.validateConfig(this.config);

    this.renderer = new this.config.RenderClass(this.config);

    // this can be used to plug new information in the request
    // default is to just initialize the model
    this.onRequestStarted(this.transformRequest);

    // we treat onLaunchRequest as an intentRequest for the openIntent
    this.onLaunchRequest((request, reply) => {
      const intent = this.config.openIntent || 'LaunchIntent';
      _.set(request, 'intent.name', intent);
      _.set(request, 'intent.slots', {});

      return this.requestHandlers.IntentRequest(request, reply);
    }, true);

    // run the state machine for intentRequests
    this.onIntentRequest(this.runStateMachine, true);

    // my default is to render with the message renderer on state machine
    // transitions, doing it like this means the state machine doesn't need to
    // know about rendering or anything like that
    this.onAfterStateChanged((request, reply, result) => {
      if (result && result.reply instanceof Reply) {
        result.message = result.reply;
        return result;
      }

      return this.renderer.render(request, reply, result);
    });

    this.onBeforeReplySent((request, reply, transition) => {
      request.session.attributes = _.merge(request.session.attributes, {
        data: request.model.serialize(),
        state: transition.to.name,
      });

      if (reply.msg.hasAnAsk) {
        request.session.attributes.reply = _.pickBy({ msgPath: transition.reply, state: transition.to.name });
      }
    });

    // default onStateMachineError action is to just defer to the general error handler
    this.onStateMachineError((request, reply, error) => this.handleErrors(request, error), true);
  }

  registerEvents() {
    super.registerEvents();
    // this are all StateMachine events
    this.registerEvent('onBeforeStateChanged');
    this.registerEvent('onAfterStateChanged');
    this.registerEvent('onBeforeReplySent');
    // Sent when the state machine failed to return a carrect reply
    this.registerEvent('onUnhandledState');
    // Sent when a state machine transition fails
    this.registerEvent('onStateMachineError');
  }

  static validateConfig(config) {
    if (!config.Model.fromRequest) {
      throw new Error('Model should have a fromRequest method');
    }

    if (!config.Model.serialize && !(config.Model.prototype && config.Model.prototype.serialize)) {
      throw new Error('Model should have a serialize method');
    }
  }

  handleStateMachineErrors(request, reply, error) {
    debug('handleStateMachineErrors');
    return Promise.reduce(this.getOnStateMachineErrorHandlers(), (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, reply, error));
    }, null)
      .then((errorReply) => {
        if (errorReply instanceof Reply) {
          return errorReply.write();
        }

        return errorReply;
      });
  }

  onState(stateName, handler) {
    if (_.isFunction(handler)) {
      this.states[stateName] = { enter: handler };
    } else {
      this.states[stateName] = { to: handler };
    }

    this.states[stateName].name = stateName;
  }

  onIntent(intentName, handler) {
    if (!this.states.entry) {
      this.states.entry = { to: {}, name: 'entry' };
    }
    this.states.entry.to[intentName] = intentName;
    this.onState(intentName, handler);
  }

  runStateMachine(request, reply) {
    const fromState = request.session.new ? 'entry' : request.session.attributes.state || 'entry';
    const stateMachine = new StateMachine(fromState, {
      states: this.states,
      onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(),
      onAfterStateChanged: this.getOnAfterStateChangedHandlers(),
      onUnhandledState: this.getOnUnhandledStateHandlers(),
    });

    debug('Starting the state machine from %s state', fromState);

    return stateMachine.transition(request, reply)
      .then((transition) => {
        let promise = Promise.resolve(null);
        if (transition.to.isTerminal) {
          promise = this.handleOnSessionEnded(request, reply);
        }

        return promise
          .then(() => {
            debug('Running onBeforeReplySent');
            return Promise.mapSeries(this.getOnBeforeReplySentHandlers(), fn => fn(request, reply, transition));
          })
          .then(() => reply);
      })
      .catch(error => this.handleStateMachineErrors(request, reply, error));
  }

  transformRequest(request) {
    return Promise.try(() => this.config.Model.fromRequest(request)).then((model) => {
      request.model = model;
      debug('Initialized model like %s', JSON.stringify(request.model));
    });
  }
}

module.exports = StateMachineSkill;
