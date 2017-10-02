'use strict';

const _ = require('lodash');

class Model {
  constructor(data) {
    _.assign(this, data);
  }

  static fromEvent(voxaEvent) {
    return new this(voxaEvent.session.attributes.model);
  }

  serialize() {
    return this;
  }
}

module.exports = Model;
