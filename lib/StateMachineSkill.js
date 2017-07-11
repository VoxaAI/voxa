'use strict';

const Promise = require('bluebird');
const AlexaSkill = require('./AlexaSkill');
const StateMachine = require('./StateMachine');
const _ = require('lodash');
const DefaultRenderer = require('./renderers/DefaultRenderer');
const Reply = require('../lib/Reply');
const debug = require('debug')('voxa');
const Model = require('./Model');

class StateMachineSkill extends AlexaSkill {
  constructor(config) {
    super(config);
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
    this.onLaunchRequest((alexaEvent, reply) => {
      const intent = this.config.openIntent || 'LaunchIntent';
      _.set(alexaEvent, 'intent.name', intent);
      _.set(alexaEvent, 'intent.slots', {});

      return this.requestHandlers.IntentRequest(alexaEvent, reply);
    }, true);

    // run the state machine for intentRequests
    this.onIntentRequest(this.runStateMachine, true);
    // my default is to render with the message renderer on state machine
    // transitions, doing it like this means the state machine doesn't need to
    // know about rendering or anything like that
    this.onAfterStateChanged((alexaEvent, reply, result) => {
      if (result && result.reply instanceof Reply) {
        result.message = result.reply;
        return result;
      }

      return this.renderer.render(alexaEvent, reply, result);
    });

    this.onBeforeReplySent((alexaEvent, reply, transition) => {
      const serialize = _.get(alexaEvent, 'model.serialize');
      alexaEvent.session.attributes.state = transition.to.name;

      // we do require models to have a serialize method and check that when Voxa is initialized,
      // however, developers could do stuff like `alexaEvent.model = null`,
      // which seems natural if they want to
      // clear the model
      if (!serialize) {
        alexaEvent.session.attributes.modelData = null;
        return Promise.resolve(null);
      }

      return Promise.resolve(alexaEvent.model.serialize())
        .then((modelData) => {
          alexaEvent.session.attributes.modelData = modelData;
        });
    });

    // default onStateMachineError action is to just defer to the general error handler
    this.onStateMachineError((alexaEvent, reply, error) =>
      this.handleErrors(alexaEvent, error), true);
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
    if (!config.Model.fromEvent) {
      throw new Error('Model should have a fromEvent method');
    }

    if (!config.Model.serialize && !(config.Model.prototype && config.Model.prototype.serialize)) {
      throw new Error('Model should have a serialize method');
    }
  }

  handleStateMachineErrors(alexaEvent, reply, error) {
    debug('handleStateMachineErrors');
    return Promise.reduce(this.getOnStateMachineErrorHandlers(), (errorReply, errorHandler) => {
      if (errorReply) {
        return errorReply;
      }
      return Promise.resolve(errorHandler(alexaEvent, reply, error));
    }, null)
    .then((errorReply) => {
      errorReply.error = error;
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

  runStateMachine(alexaEvent, reply) {
    const fromState = alexaEvent.session.new ? 'entry' : alexaEvent.session.attributes.state || 'entry';
    const stateMachine = new StateMachine(fromState, {
      states: this.states,
      onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(),
      onAfterStateChanged: this.getOnAfterStateChangedHandlers(),
      onUnhandledState: this.getOnUnhandledStateHandlers(),
    });

    debug('Starting the state machine from %s state', fromState);

    return stateMachine.transition(alexaEvent, reply)
      .then((transition) => {
        let promise = Promise.resolve(null);
        if (transition.to.isTerminal) {
          promise = this.handleOnSessionEnded(alexaEvent, reply);
        }

        const onBeforeReplyHandlers = this.getOnBeforeReplySentHandlers();

        return promise
          .then(() => {
            debug('Running onBeforeReplySent');
            return Promise
            .mapSeries(onBeforeReplyHandlers, fn => fn(alexaEvent, reply, transition));
          })
        .then(() => reply);
      })
    .catch(error => this.handleStateMachineErrors(alexaEvent, reply, error));
  }

  transformRequest(alexaEvent) {
    return Promise.try(() => this.config.Model.fromEvent(alexaEvent))
      .then((model) => {
        alexaEvent.model = model;
        debug('Initialized model like %s', JSON.stringify(alexaEvent.model));
      });
  }
}

module.exports = StateMachineSkill;
