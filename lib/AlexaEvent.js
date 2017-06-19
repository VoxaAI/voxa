'use strict';

const _ = require('lodash');

class AlexaEvent {
  constructor(event, lambdaContext) {
    _.merge(this, {
      session: {
        attributes: { },
      },
    }, event);

    if (_.isEmpty(_.get(this, 'session.attributes'))) {
      _.set(this, 'session.attributes', {});
    }

    this.lambdaContext = lambdaContext;
    this.intent = new Intent(this.request.intent);
  }

  get user() {
    return _.get(this, 'session.user') || _.get(this, 'context.System.user');
  }
}

class Intent {
  constructor(rawIntent) {
    _.merge(this, rawIntent);
  }

  get params() {
    return _(this.slots)
      .map(s => [s.name, s.value])
      .fromPairs()
      .value();
  }
}

module.exports = AlexaEvent;
