'use strict';

const debug = require('debug')('voxa');
const Promise = require('bluebird');
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
  }

  render(alexaEvent, reply, result) {
    if (!result) {
      return Promise.resolve(result);
    }

    debug('rendering', result.reply);
    let views;

    if (result.message) {
      _.merge(result, {
        message: result.message,
      });
      return result;
    }

    if (_.isArray(result.reply)) {
      views = result.reply;
    } else {
      views = [result.reply];
    }

    return Promise.map(views, view => this.renderPath(view, alexaEvent)
      .then((message) => {
        if (result.directives) {
          message.directives = result.directives;
        }
        _.merge(result, {
          message,
        });
        return message;
      }))
      .then((messages) => {
        result.message = messages;
        return result;
      });
  }

  renderPath(msgPath, alexaEvent) {
    if (!msgPath) {
      return Promise.resolve({});
    }

    const msg = _.cloneDeep(_.get(this.config.views, msgPath));
    if (!msg) {
      return Promise.reject(new Error(`Missing view ${msgPath}`));
    }

    return this.renderMessage(msg, alexaEvent);
  }

  renderMessage(msg, alexaEvent) {
    const toRender = ['ask', 'tell', 'say', 'reprompt', 'card.title', 'card.content', 'card.text', 'card.image.smallImageUrl', 'card.image.largeImageUrl'];

    return Promise.all(_(toRender)
      .map((key) => {
        const statement = _.at(msg, key)[0];
        if (!statement) return null;
        return this.renderStatement(statement, alexaEvent)
          .then(rendered => _.set(msg, key, rendered));
      })
      .compact()
      .value())
      .then(() => msg);
  }

  renderStatement(statement, alexaEvent) {
    const tokens = template.tokens(statement);
    const qVariables = tokens.map((token) => {
      const variable = this.config.variables[token];
      if (!variable) return Promise.reject(new Error(`No such variable ${token}`));
      return Promise.try(() => variable(alexaEvent.model, alexaEvent));
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
