'use strict';

const Promise = require('bluebird');
const AlexaSkill = require('./AlexaSkill');
const StateMachine = require('./StateMachine');
const MessageRenderer = require('alexa-helpers').messageRenderer;
const _ = require('lodash');
const debug = require('debug')('alexa-statemachine');

class StateMachineSkill extends AlexaSkill {
  constructor(appId, config) {
    super(appId, config);
    StateMachineSkill.validateConfig(config);
    this.states = {};

    // this can be used to plug new information in the request
    // default is to just initialize the model
    this.onRequestStarted(this.transformRequest, true);

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
    this.onAfterStateChanged(this.render, true);

    // default onStateMachineError action is to just defer to the general error handler
    this.onStateMachineError(this.handleErrors, true);
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

    if (!config.views) {
      throw new Error('Config should include views');
    }
  }

  handleStateMachineErrors(request, reply, error) {
    debug('handleStateMachineErrors');
    return Promise.reduce(this.getErrorHandlers('onStateMachineError'), (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, reply, error));
    }, null);
  }

  render(request, reply, result) {
    if (!result || !result.reply) {
      return Promise.resolve(result);
    }

    const messageRenderer = MessageRenderer(this.config.views, this.config.variables);

    return messageRenderer(result.reply, request.model)
      .then((message) => {
        let msgReply = null;
        if (message) {
          if (message.ask) {
            msgReply = { msgPath: result.reply, state: result.to };
          }

          message.directives = result.directives;
        }

        _.merge(result, {
          message,
          session: {
            data: request.model.serialize(),
            startTimestamp: request.session.attributes.startTimestamp,
            reply: msgReply,
          },
        });
        request.session.attributes = result.session || request.session.attributes || {};

        return result;
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
      .then((trans) => {
        reply.session.attributes.state = trans.to.name;

        let promise = Promise.resolve(null);
        if (trans.to.isTerminal) {
          promise = this.handleOnSessionEnded(request, reply);
        }

        return promise
          .then(() => {
            debug('Running onBeforeReplySent');
            return Promise.mapSeries(this.getOnBeforeReplySentHandlers(), fn => fn(request, reply));
          })
          .then(() => reply.write());
      })
      .catch(error => this.handleStateMachineErrors(request, reply, error));
  }

  transformRequest(request) {
    request.model = this.config.Model.fromRequest(request);
    debug('Initialized model like %s', JSON.stringify(request.model));
  }
}

module.exports = StateMachineSkill;
