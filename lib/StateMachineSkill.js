'use strict';

const Promise = require('bluebird');
const AlexaSkill = require('./AlexaSkill');
const StateMachine = require('./StateMachine');
const MessageRenderer = require('alexa-helpers').messageRenderer;
const _ = require('lodash');
const BadResponse = require('./Errors').BadResponse;
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
    // Sent when the state machine failed to return a carrect reply
    this.eventHandlers.onBadResponse = [];
    // Sent when a state machine transition fails
    this.eventHandlers.onStateMachineError = [];

    this.onIntentRequest((request, reply) => this.runStateMachine(request, reply));

    // this can be used to plug new information in the request
    // default is to just initialize the model
    this.onRequestStarted(request => this.transformRequest(request));

    // we treat onLaunchRequest as an intentRequest for the openIntent
    this.onLaunchRequest((request, reply) => {
      const intent = this.config.openIntent || 'LaunchIntent';
      _.set(request, 'intent.name', intent);
      _.set(request, 'intent.slots', {});

      return this.requestHandlers.IntentRequest(request, reply);
    });

    // my default is to render with the message renderer on state machine
    // transitions, doing it like this means the state machine doesn't need to
    // know about rendering or anything like that
    this.onAfterStateChanged((request, reply, result) => this.render(request, reply, result));

    // default onBadResponse action is to just defer to the state machine error handler
    this.onBadResponse((request, reply, error) =>
        this.handleStateMachineErrors(request, reply, error));

    // default onStateMachineError action is to just defer to the general error handler
    this.onStateMachineError((request, reply, error) => this.handleErrors(request, error));
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

  handleOnBadResponseErrors(request, reply, error) {
    // iterate on all error handlers and simply return the first one that
    // generates a reply
    return Promise.reduce(this.eventHandlers.onBadResponse, (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(request, reply, error));
    }, null);
  }

  handleStateMachineErrors(request, reply, error) {
    return Promise.reduce(this.eventHandlers.onStateMachineError, (result, errorHandler) => {
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
      this.states[stateName] = {
        enter: handler,
      };
    } else {
      this.states[stateName] = handler;
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

  onBeforeStateChanged(callback) {
    this.eventHandlers.onBeforeStateChanged.push(callback);
  }

  onBeforeReplySent(callback) {
    this.eventHandlers.onBeforeReplySent.push(callback);
  }

  onAfterStateChanged(callback) {
    this.eventHandlers.onAfterStateChanged.unshift(callback);
  }

  onBadResponse(callback) {
    this.eventHandlers.onBadResponse.unshift(callback);
  }

  onStateMachineError(callback) {
    this.eventHandlers.onStateMachineError.unshift(callback);
  }

  runStateMachine(request, reply) {
    const fromState = request.session.new ? 'entry' : request.session.attributes.state || 'entry';
    const stateMachine = new StateMachine(fromState, {
      states: this.states,
      onBeforeStateChanged: this.eventHandlers.onBeforeStateChanged,
      onAfterStateChanged: this.eventHandlers.onAfterStateChanged,
    });

    debug('Starting the state machine from %s state', fromState);

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
          .then(() => Promise.mapSeries(this.eventHandlers.onBeforeReplySent,
            fn => fn(request, reply)))
          .then(() => reply.write());
      })
      .catch(BadResponse, error => this.handleOnBadResponseErrors(request, reply, error))
      .catch(error => this.handleStateMachineErrors(request, reply, error));
  }


  transformRequest(request) {
    request.model = this.config.Model.fromRequest(request);
    debug('Initialized model like %s', JSON.stringify(request.model));
  }
}

module.exports = StateMachineSkill;
