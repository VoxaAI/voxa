'use strict';

const _ = require('lodash');
const VoxaEvent = require('../../VoxaEvent');

class DialogFlowEvent extends VoxaEvent {
  constructor(event, context) {
    super(event, context);
    _.merge(this, {
      session: {
      },
      request: {
        locale: event.lang,
        type: 'IntentRequest',
      },
    }, event);

    this.session = new DialogFlowSession(event);
    this.intent = new Intent(event);
    this.raw = event;
    this.type = 'dialogFlow';
  }

  get user() {
    return _.get(this, 'originalRequest.data.user');
  }
}

class DialogFlowSession {
  constructor(rawEvent) {
    this.contexts = rawEvent.result.contexts;
    this.attributes = this.getAttributes();
  }

  getAttributes() {
    if (!this.contexts) {
      return {};
    }
    const attributes = _(this.contexts)
      .map((context) => {
        const contextName = context.name;
        let contextParams;
        if (context.parameters[contextName]) {
          contextParams = context.parameters[contextName];
        } else {
          contextParams = context.parameters;
        }
        return [contextName, contextParams];
      })
      .fromPairs()
      .value();

    return attributes;
  }
}


class Intent {
  constructor(rawEvent) {
    this.result = rawEvent.result;
    this.originalRequest = rawEvent.originalRequest;

    if (this.result.resolvedQuery === 'actions_intent_OPTION') {
      this.name = 'actions.intent.OPTION';
    } else {
      this.name = rawEvent.result.metadata.intentName;
    }
  }

  get params() {
    if (this.result.resolvedQuery === 'actions_intent_OPTION') {
      const input = _.find(this.originalRequest.data.inputs, { intent: 'actions.intent.OPTION' });
      const args = _(input.arguments)
        .map(argument => [argument.name, argument.textValue])
        .fromPairs()
        .value();

      return args;
    }
    return this.result.parameters;
  }
}

module.exports = DialogFlowEvent;

