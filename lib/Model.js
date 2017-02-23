'use strict';

const _ = require('lodash');

class Model {
  constructor(data) {
    _.assign(this, data);
  }

  static fromRequest(request) {
    return new Model(request.session.attributes.data);
  }

  serialize() {
    return this;
  }
}

module.exports = Model;
