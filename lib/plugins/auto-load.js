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

  skill.onSessionStarted(alexaEvent => defaultConfig.adapter.get(alexaEvent.session.user)
  .then((data) => {
    debug(`Data fetched: ${data}`);
    alexaEvent.model.user = data;
    return alexaEvent;
  })
  .catch((error) => {
    debug(`Error getting data: ${error}`);
    throw error;
  }));
}

module.exports = autoLoad;
