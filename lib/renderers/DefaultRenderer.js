'use strict';

const debug = require('debug')('alexa-statemachine');
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

  render(request, reply, result) {
    if (!result) {
      return Promise.resolve(result);
    }

    debug('rendering', result.reply);
    return this.renderPath(result.reply, request)
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

  renderPath(msgPath, request) {
    if (!msgPath) {
      return Promise.resolve({});
    }

    const msg = _.cloneDeep(_.get(this.config.views, msgPath));
    return this.renderMessage(msg, request);
  }

  renderMessage(msg, request) {
    const toRender = ['ask', 'tell', 'say', 'reprompt', 'card.title', 'card.content', 'card.text', 'card.image.smallImageUrl', 'card.image.largeImageUrl'];

    return Promise.all(_(toRender)
      .map((key) => {
        const statement = _.at(msg, key)[0];
        if (!statement) return null;
        return this.renderStatement(statement, request)
          .then(rendered => _.set(msg, key, rendered));
      })
      .compact()
      .value())
      .then(() => msg);
  }

  renderStatement(statement, request) {
    const tokens = template.tokens(statement);
    const qVariables = tokens.map((token) => {
      const variable = this.config.variables[token];
      if (!variable) return Promise.reject(new Error(`No such variable ${token}`));
      return Promise.try(() => variable(request.model, request));
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
