'use strict';

const _ = require('lodash');
const VoxaEvent = require('../../VoxaEvent');

class ApiAiEvent extends VoxaEvent {
  constructor(event, lambdaContext) {
    super();
    _.merge(this, {
      session: {
      },
      request: {
        locale: event.lang,
        type: 'IntentRequest',
      },
    }, event);

    this.session = new ApiAiSession(event);
    this.intent = new Intent(event);
    this.raw = event;
    this.type = 'api.ai';
  }

  get user() {
    return _.get(this, 'originalRequest.data.user');
  }
}

class ApiAiSession {
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
    this.name = rawEvent.result.metadata.intentName;
    this.result = rawEvent.result;
  }

  get params() {
    return this.result.parameters;
  }
}

module.exports = ApiAiEvent;

