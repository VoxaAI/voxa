'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');

function autoLoad(skill, adapter, config) {
  skill.onRequestStarted((alexaEvent) => {
    if (!config) {
      config = { loadByToken: false };
    }

    if (config.loadByToken && !_.get(alexaEvent, 'session.user.accessToken')) {
      debug('Missing token on load data by token operation');
      return alexaEvent;
    }

    let key = _.get(alexaEvent, 'session.user.userId') || _.get(alexaEvent, 'lambdaContext.System.user.userId');

    if (config.loadByToken) {
      key = alexaEvent.session.user.accessToken;
    }

    if (typeof adapter.get === 'function') {
      return adapter.get(key)
      .then((data) => {
        _.assign(alexaEvent.model, data);
        return alexaEvent;
      })
      .catch((error) => {
        debug(`Error getting data: ${error}`);
        return alexaEvent;
      });
    }

    debug('No get method to fetch data from');
    return alexaEvent;
  });
}

module.exports = autoLoad;
