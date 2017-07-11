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
    let views;

    if (_.isArray(result.reply)) {
      views = result.reply;
    } else {
      views = [result.reply];
    }

    return this.i18nextPromise
      .then(() => Promise.map(views, view => this.renderPath(view, alexaEvent)))
      .then((message) => {
        if (result.directives) {
          message.directives = result.directives;
        }
        _.merge(result, {
          message,
        });
        return message;
      })
      .then((messages) => {
        result.message = messages;
        return result;
      });
  }

  renderPath(view, alexaEvent) {
    debug('Setting locale to %s', alexaEvent.request.locale);
    const t = i18next.getFixedT(alexaEvent.request.locale);
    const message = t(view, {
      returnObjects: true,
    });

    if (_.isString(message) && message === view) {
      throw new Error(`View ${view} for ${alexaEvent.request.locale} locale are missing`);
    }

    return this.renderMessage(message, alexaEvent);
  }
}

module.exports = I18NRenderer;
