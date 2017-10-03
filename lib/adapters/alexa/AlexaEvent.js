'use strict';

const _ = require('lodash');
const VoxaEvent = require('../../VoxaEvent');

class AlexaEvent extends VoxaEvent {
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

    this.lambdaContext = lambdaContext;
    if (_.get(event, 'request.type') === 'LaunchRequest') {
      this.intent = new Intent({ name: 'LaunchIntent', slots: {} });
    } else {
      this.intent = new Intent(this.request.intent);
    }

    this.lambdaContext = lambdaContext;
    this.raw = event;
    this.type = 'alexa';
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
