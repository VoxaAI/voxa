'use strict';

const _ = require('lodash');
const VoxaEvent = require('../../VoxaEvent');

class AlexaEvent extends VoxaEvent {
  constructor(event, context) {
    super(event, context);
    this.session = event.session;
    this.request = event.request;
    this.context = event.context;

    if (_.isEmpty(_.get(this, 'session.attributes'))) {
      _.set(this, 'session.attributes', {});
    }

    if (_.get(event, 'request.type') === 'LaunchRequest') {
      this.intent = new Intent({ name: 'LaunchIntent', slots: {} });
      this.request.type = 'IntentRequest';
    } else if (_.get(event, 'request.type') === 'Display.ElementSelected') {
      this.intent = new Intent({ name: 'DisplayElementSelected', slots: {} });
      this.request.type = 'IntentRequest';
    } else {
      this.intent = new Intent(this.request.intent);
    }

    this.type = 'alexa';
  }

  get user() {
    return _.get(this, 'session.user') || _.get(this, 'context.System.user');
  }

  get token() {
    return _.get(this, 'request.token');
  }
}

class Intent {
  constructor(rawIntent) {
    this._raw = rawIntent;
    this.name = _.get(rawIntent, 'name', '').replace(/^AMAZON./, '');
  }

  get params() {
    return _(this._raw.slots)
      .map(s => [s.name, s.value])
      .fromPairs()
      .value();
  }
}

module.exports = AlexaEvent;
