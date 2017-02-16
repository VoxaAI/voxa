'use strict';

const Promise = require('bluebird');
const i18next = Promise.promisifyAll(require('i18next'));
const debug = require('debug')('alexa-statemachine');
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

  render(request, reply, result) {
    if (!result || !result.reply) {
      return Promise.resolve(result);
    }

    return this.i18nextPromise
      .then(() => {
        debug('Setting locale to %s', request.locale);
        const t = i18next.getFixedT(request.locale);
        const message = t(result.reply, {
          returnObjects: true,
        });

        return this.renderMessage(message, request);
      })
      .then((message) => {
        let msgReply = null;
        if (message) {
          if (message.ask) {
            msgReply = { msgPath: result.reply, state: result.to };
          }

          message.directives = result.directives;
        }

        _.merge(result, {
          message,
          session: {
            data: request.model.serialize(),
            startTimestamp: request.session.attributes.startTimestamp,
            reply: msgReply,
          },
        });
        request.session.attributes = result.session || request.session.attributes || {};

        return result;
      });
  }
}

module.exports = I18NRenderer;
