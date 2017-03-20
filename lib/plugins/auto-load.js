'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');

function autoLoad(skill, config) {
  skill.onRequestStarted((alexaEvent) => {
    if (!config) {
      throw Error('Empty config file');
    }

    if (!config.adapter) {
      throw Error('Empty adapter');
    }

    if (config.loadByToken && !_.get(alexaEvent, 'session.user.accessToken')) {
      debug('Missing token on load data by token operation');
      return alexaEvent;
    }

    let key = _.get(alexaEvent, 'user.userId');

    if (config.loadByToken) {
      key = alexaEvent.session.user.accessToken;
    }

    if (typeof config.adapter.get === 'function') {
      return config.adapter.get(key)
      .then((data) => {
        alexaEvent.model.user = data;
        return alexaEvent;
      })
      .catch((error) => {
        debug(`Error getting data: ${error}`);
        throw error;
      });
    }

    throw Error('No get method to fetch data from');
  });
}

module.exports = autoLoad;
