'use strict';

const _ = require('lodash');

class VoxaEvent {
  constructor(event, context) {
    this._raw = _.cloneDeep(event);
    this._context = context;
  }
}

module.exports = VoxaEvent;

