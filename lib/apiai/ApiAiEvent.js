'use strict';

const _ = require('lodash');
const VoxaEvent = require('../VoxaEvent');

class ApiAiEvent extends VoxaEvent {
  constructor(event, lambdaContext) {
    super();
    _.merge(this, {
      session: {
        attributes: { },
      },
      request: { },
    }, event);

    if (_.isEmpty(_.get(this, 'session.attributes'))) {
      _.set(this, 'session.attributes', {});
    }

    if (_.get(this, 'result.metadata.intentName')) {
      this.request.type = 'IntentRequest';
      this.intent = new Intent(this.result);
    }

    this.type = 'api.ai';
  }
}

class Intent {
  constructor(result) {
    _.merge(this, result);
    this.name = result.metadata.intentName;
  }

  get params() {
    return this.parameters;
  }
}

module.exports = ApiAiEvent;
