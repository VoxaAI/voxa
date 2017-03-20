'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');

let defaultConfig = { loadByToken: false };

function autoLoad(skill, config) {
  if (!config) {
    throw Error('Empty config file');
  }

  if (!config.adapter) {
    throw Error('Empty adapter');
  }

  if (!_.isFunction(config.adapter.get)) {
    throw Error('No get method to fetch data from');
  }

  defaultConfig = _.merge(defaultConfig, config);

  skill.onRequestStarted((alexaEvent) => {
    if (defaultConfig.loadByToken && !_.get(alexaEvent, 'session.user.accessToken')) {
      debug('Missing token on load data by token operation');
      return alexaEvent;
    }

    let key = _.get(alexaEvent, 'user.userId');

    if (defaultConfig.loadByToken) {
      key = alexaEvent.session.user.accessToken;
    }

    return defaultConfig.adapter.get(key)
    .then((data) => {
      alexaEvent.model.user = data;
      return alexaEvent;
    })
    .catch((error) => {
      debug(`Error getting data: ${error}`);
      throw error;
    });
  });
}

module.exports = autoLoad;
