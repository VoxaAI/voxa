'use strict';

const _ = require('lodash');

module.exports = function Request(event, lambdaContext) {
  _.assign(this, event.request);
  this.session = _.cloneDeep(event.session) || {};
  this.session.attributes = this.session.attributes || {};
  this.user = this.session.user;
  this.from = this.session.attributes.state || 'entry';
  this.lambdaContext = lambdaContext;

  if (event.request.intent) {
    this.intent.params = _(event.request.intent.slots)
      .map(s => [s.name, s.value])
      .fromPairs()
      .value();
  }
};
