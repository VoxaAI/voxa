'use strict';

var _ = require('lodash');

module.exports = function Request(request, session) {
  session = session || {};
  session.attributes = session.attributes || {};
  _.assign(this, request);
  this.session = session;
  this.user = session.user;
  if (request.intent) this.intent.params = _(request.intent.slots).map(function(s) {
    return [s.name, s.value];
  }).fromPairs().value();
  this.from = session.attributes.state || 'entry';
};
