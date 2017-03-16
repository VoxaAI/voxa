'use strict';

const _ = require('lodash');

class Model {
  constructor(data) {
    _.assign(this, data);
  }

  static fromEvent(alexaEvent) {
    return new this(alexaEvent.session.attributes.modelData);
  }

  serialize() {
    return this;
  }
}

module.exports = Model;
