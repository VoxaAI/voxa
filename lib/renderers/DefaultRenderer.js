'use strict';

const debug = require('debug')('voxa');
const Promise = require('bluebird');
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

  renderMessage(msg, event) {
    function deepSearchStatement(statement, alexaEvent) {
      if (_.isObject(statement) && !_.isArray(statement)) {
        return Promise.try(() => {
          const objPromises = _.chain(statement)
          .toPairs()
          .map((item) => {
            const key = item[0];
            const value = item[1];
            const isAnOpenResponse = _.includes(['ask', 'tell', 'say', 'reprompt'], key);
            if (isAnOpenResponse && _.isArray(value)) {
              return [key, deepSearchStatement.call(this, _.sample(value), alexaEvent)];
            }
            return [key, deepSearchStatement.call(this, value, alexaEvent)];
          })
          .flattenDeep()
          .value();

          return Promise.all(objPromises)
          .then(result => _.chain(result).chunk(2).fromPairs().value());
        });
      }

      if (_.isString(statement)) {
        return Promise.try(() => this.renderStatement(statement, alexaEvent));
      }

      if (_.isArray(statement)) {
        return Promise
        .map(statement, statementItem => deepSearchStatement.call(this, statementItem, alexaEvent));
      }

      return Promise.resolve(statement);
    }

    return deepSearchStatement.call(this, msg, event);
  }

  renderStatement(statement, alexaEvent) {
    const tokenRegx = /{([\s\S]+?)}/g;
    _.templateSettings.interpolate = tokenRegx;
    const tokenKeys = _
      .uniq(statement.match(tokenRegx) || [])
      .map(str => str.substring(1, str.length - 1));

    const qVariables = _(this.config.variables)
    .toPairs()
    .filter(item => _.includes(tokenKeys, item[0]))
    .map(item => [item[0], Promise.try(() => item[1](alexaEvent.model, alexaEvent))])
    .flattenDeep()
    .value();

    return Promise.all(qVariables)
    .then((vars) => {
      const data = _(vars).chunk(2).fromPairs().value();
      const dataKeys = _.keys(data);
      const dataValues = _.values(data);

      if (_.isEmpty(statement.replace(tokenRegx, '').trim()) && dataKeys.length === 1) {
        const singleValue = (_.head(dataValues));
        return _.isObject(singleValue) ? singleValue : _.template(statement)(data);
      }

      return _.template(statement)(data);
    })
    .catch(err => Promise.reject(new Error(`No such variable in views, ${err}`)));
  }
}

module.exports = DefaultRenderer;
