'use strict';

const StateMachineSkill = require('../StateMachineSkill');
const Promise = require('bluebird');
const i18next = require('i18next');
const debug = require('debug')('alexa-statemachine');
const _ = require('lodash');
const variableRenderer = require('./variable-renderer');

class I18NStateMachineSkill extends StateMachineSkill {
  execute(event) {
    return new Promise((resolve, reject) => {
      debug('locale:', event.request.locale);
      variableRenderer.setOptions({ variables: this.config.variables });
      return i18next
        .use(variableRenderer)
        .init({
          lng: event.request.locale,
          resources: this.config.views,
          load: 'all',
          lowerCaseLng: true,
          postProcess: 'variableRenderer',
        }, (err, t) => {
          if (err) return reject(err);
          return resolve(t);
        });
    })
      .then((t) => {
        this.t = t;
        return super.execute(event);
      });
  }

  render(request, reply, result) {
    if (!result || !result.reply) {
      return Promise.resolve(result);
    }

    const msgReply = null;
    const message = this.t(result.reply, {
      returnObjects: true,
      replace: this.config.variables,
      model: request.model,
    });

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
  }

}

module.exports = I18NStateMachineSkill;
