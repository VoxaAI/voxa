'use strict';

const _ = require('lodash');

const ApiBase = require('./ApiBase');

class DeviceBase extends ApiBase {
  constructor(alexaEvent) {
    super(alexaEvent);

    this.deviceId = _.get(alexaEvent, 'context.System.device.deviceId');
  }
}

module.exports = DeviceBase;
