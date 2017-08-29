'use strict';

const Promise = require('bluebird');
const VoxaApp = require('./VoxaApp');
const StateMachine = require('./StateMachine');
const _ = require('lodash');
const DefaultRenderer = require('./renderers/DefaultRenderer');
const Reply = require('../lib/VoxaReply');
const debug = require('debug')('voxa');
const Model = require('./Model');

class StateMachineSkill extends VoxaApp {
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

    // run the state machine for intentRequests
    this.onIntentRequest(this.runStateMachine, true);

    // my default is to render with the message renderer on state machine
    // transitions, doing it like this means the state machine doesn't need to
    // know about rendering or anything like that
    this.onAfterStateChanged((voxaEvent, reply, result) => {
      if (result && result.reply instanceof Reply) {
        result.message = result.reply;
        return result;
      }

      return this.renderer.render(voxaEvent, reply, result);
    });

    this.onBeforeReplySent((voxaEvent, reply, transition) => {
      const serialize = _.get(voxaEvent, 'model.serialize');
      voxaEvent.session.attributes.state = transition.to.name;

      // we do require models to have a serialize method and check that when Voxa is initialized,
      // however, developers could do stuff like `voxaEvent.model = null`,
      // which seems natural if they want to
      // clear the model
      if (!serialize) {
        voxaEvent.session.attributes.modelData = null;
        return Promise.resolve(null);
      }

      return Promise.resolve(voxaEvent.model.serialize())
        .then((modelData) => {
          voxaEvent.session.attributes.modelData = modelData;
        });
    });

    // default onStateMachineError action is to just defer to the general error handler
    this.onStateMachineError((voxaEvent, reply, error) =>
      this.handleErrors(voxaEvent, error), true);
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

  handleStateMachineErrors(voxaEvent, reply, error) {
    debug('handleStateMachineErrors');
    return Promise.reduce(this.getOnStateMachineErrorHandlers(), (errorReply, errorHandler) => {
      if (errorReply) {
        return errorReply;
      }
      return Promise.resolve(errorHandler(voxaEvent, reply, error));
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

  runStateMachine(voxaEvent, reply) {
    const fromState = voxaEvent.session.new ? 'entry' : voxaEvent.session.attributes.state || 'entry';
    const stateMachine = new StateMachine(fromState, {
      states: this.states,
      onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(),
      onAfterStateChanged: this.getOnAfterStateChangedHandlers(),
      onUnhandledState: this.getOnUnhandledStateHandlers(),
    });

    debug('Starting the state machine from %s state', fromState);

    return stateMachine.transition(voxaEvent, reply)
      .then((transition) => {
        let promise = Promise.resolve(null);
        if (transition.to.isTerminal) {
          promise = this.handleOnSessionEnded(voxaEvent, reply);
        }

        const onBeforeReplyHandlers = this.getOnBeforeReplySentHandlers();

        return promise
          .then(() => {
            debug('Running onBeforeReplySent');
            return Promise
            .mapSeries(onBeforeReplyHandlers, fn => fn(voxaEvent, reply, transition));
          })
        .then(() => reply);
      })
    .catch(error => this.handleStateMachineErrors(voxaEvent, reply, error));
  }

  transformRequest(voxaEvent) {
    return Promise.try(() => this.config.Model.fromEvent(voxaEvent))
      .then((model) => {
        voxaEvent.model = model;
        debug('Initialized model like %s', JSON.stringify(voxaEvent.model));
      });
  }
}

module.exports = StateMachineSkill;
