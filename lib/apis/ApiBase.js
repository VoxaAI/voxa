'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');
const rp = require('request-promise');

class ApiBase {
  constructor(alexaEvent) {
    this.alexaEvent = alexaEvent;
  }

  getToken() {
    return _.get(this.alexaEvent, 'context.System.apiAccessToken');
  }

  getEndpoint() {
    return _.get(this.alexaEvent, 'context.System.apiEndpoint');
  }

  getResult(path = '', method = 'GET', body = undefined) {
    const options = {
      uri: `${this.getEndpoint()}/${path}`,
      method,
      body,
      json: true, // Automatically parses the JSON string in the response
    };

    const token = this.getToken();

    if (token) {
      _.set(options, 'headers.Authorization', `Bearer ${token}`);
    }

    return rp(options);
  }

  checkError(err) {
    debug(`${this.tag} Error %s`, JSON.stringify(err, null, 2));

    if (err.statusCode === this.errorCodeSafeToIgnore ||
      err.error.code === this.errorCodeSafeToIgnore) {
      return undefined;
    }

    throw err;
  }

}

module.exports = ApiBase;
