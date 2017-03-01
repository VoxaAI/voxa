'use strict';

const Promise = require('bluebird');
const i18next = Promise.promisifyAll(require('i18next'));
const debug = require('debug')('voxa');
const _ = require('lodash');
const DefaultRenderer = require('./DefaultRenderer.js');

class I18NRenderer extends DefaultRenderer {
  constructor(config) {
    super(config);
    this.i18nextPromise = i18next
      .initAsync({
        resources: this.config.views,
        load: 'all',
        lowerCaseLng: true,
      });
  }

  render(alexaEvent, reply, result) {
    if (!result || !result.reply) {
      return Promise.resolve(result);
    }

    return this.i18nextPromise
      .then(() => {
        debug('Setting locale to %s', alexaEvent.request.locale);
        const t = i18next.getFixedT(alexaEvent.request.locale);
        const message = t(result.reply, {
          returnObjects: true,
        });

        return this.renderMessage(message, alexaEvent);
      })
      .then((message) => {
        if (message) {
          message.directives = result.directives;
        }

        _.merge(result, {
          message,
        });

        return result;
      });
  }
}

module.exports = I18NRenderer;
