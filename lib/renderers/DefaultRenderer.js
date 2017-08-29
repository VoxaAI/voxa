'use strict';

const debug = require('debug')('voxa');
const Promise = require('bluebird');
const i18next = Promise.promisifyAll(require('i18next'));
const template = require('alexa-helpers').template;
const _ = require('lodash');

class DefaultRenderer {
  constructor(config) {
    if (!config.variables) {
      config.variables = {};
    }

    if (!config.views) {
      throw new Error('DefaultRenderer config should include views');
    }

    this.config = config;
    this.i18nextPromise = i18next
      .initAsync({
        resources: this.config.views,
        load: 'all',
        lowerCaseLng: true,
      });
  }

  render(voxaEvent, reply, result) {
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
      .then(() => Promise.map(views, view => this.renderPath(view, voxaEvent)))
      .then((message) => {
        if (result.directives) {
          message[0].directives = result.directives;
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

  renderPath(view, voxaEvent) {
    debug('Setting locale to %s', voxaEvent.request.locale);
    const t = i18next.getFixedT(voxaEvent.request.locale);
    const message = t(view, {
      returnObjects: true,
    });

    if (_.isString(message) && message === view) {
      throw new Error(`View ${view} for ${voxaEvent.request.locale} locale are missing`);
    }

    return this.renderMessage(message, voxaEvent);
  }

  renderMessage(msg, voxaEvent) {
    const toRender = ['ask', 'tell', 'say', 'reprompt', 'card.title', 'card.content', 'card.text', 'card.image.smallImageUrl', 'card.image.largeImageUrl'];

    return Promise.all(_(toRender)
      .map((key) => {
        let statement = _.at(msg, key)[0];
        if (!statement) return null;
        if (_.isArray(statement)) {
          statement = _.sample(statement);
        }

        return this.renderStatement(statement, voxaEvent)
          .then(rendered => _.set(msg, key, rendered));
      })
      .compact()
      .value())
      .then(() => msg);
  }

  renderStatement(statement, voxaEvent) {
    const tokens = template.tokens(statement);
    const qVariables = tokens.map((token) => {
      const variable = this.config.variables[token];
      if (!variable) return Promise.reject(new Error(`No such variable ${token}`));
      return Promise.try(() => variable(voxaEvent.model, voxaEvent));
    });

    const qAll = Promise.all(qVariables);

    return qAll.then((vars) => {
      const tokensWithVars = _.zip(tokens, vars);
      const data = _.fromPairs(tokensWithVars);

      return template(statement, data);
    });
  }
}

module.exports = DefaultRenderer;
