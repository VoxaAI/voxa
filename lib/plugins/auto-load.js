'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');

let defaultConfig = {};

function autoLoad(skill, config) {
  if (!config) {
    throw Error('Missing config object');
  }

  if (!config.adapter) {
    throw Error('Missing adapter');
  }

  if (!_.isFunction(config.adapter.get)) {
    throw Error('No get method to fetch data from');
  }

  defaultConfig = _.merge(defaultConfig, config);

  skill.onSessionStarted(voxaEvent => defaultConfig.adapter.get(voxaEvent.session.user)
  .then((data) => {
    debug(`Data fetched: ${data}`);
    voxaEvent.model.user = data;
    return voxaEvent;
  })
  .catch((error) => {
    debug(`Error getting data: ${error}`);
    throw error;
  }));
}

module.exports = autoLoad;
