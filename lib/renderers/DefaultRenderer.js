'use strict';

const debug = require('debug')('voxa');
const Promise = require('bluebird');
const i18next = Promise.promisifyAll(require('i18next'));
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
        nonExplicitWhitelist: true,
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
    let message = t(view, {
      returnObjects: true,
    });

    if (message[voxaEvent.type]) {
      message = message[voxaEvent.type];
    }

    if (_.isString(message) && message === view) {
      return Promise.reject(new Error(`View ${view} for ${voxaEvent.request.locale} locale are missing`));
    }

    return this.renderMessage(message, voxaEvent);
  }

  renderMessage(msg, event) {
    /**
     * it makes a deep search for strings that could have a variable on it
     * @param  any statement - can be a string, array, object or any other value
     * @param VoxaEvent voxaEvent
     * @return Promise             Promise with the statement rendered
     * @example
     * // return { Launch: 'Hi, morning', card: { type: 'Standard', title: 'title' ...}}
     * deepSearchRenderVariable({ Launch: 'hi, {time}', card: '{exitCard}' }, voxaEvent);
     */
    function deepSearchRenderVariable(statement, voxaEvent) {
      if (_.isObject(statement) && !_.isArray(statement)) {
        return Promise.try(() => {
          const objPromises = _.chain(statement)
          .toPairs()
          .map((item) => {
            const key = item[0];
            const value = item[1];
            const isAnOpenResponse = _.includes(['ask', 'tell', 'say', 'reprompt'], key);
            if (isAnOpenResponse && _.isArray(value)) {
              return [key, deepSearchRenderVariable.call(this, _.sample(value), voxaEvent)];
            }
            return [key, deepSearchRenderVariable.call(this, value, voxaEvent)];
          })
          .flattenDeep()
          .value();

          return Promise.all(objPromises)
          .then(result => _.chain(result).chunk(2).fromPairs().value());
        });
      }

      if (_.isString(statement)) {
        return Promise.try(() => this.renderStatement(statement, voxaEvent));
      }

      if (_.isArray(statement)) {
        return Promise
        .map(statement, statementItem => deepSearchRenderVariable.call(this, statementItem, voxaEvent));
      }

      return Promise.resolve(statement);
    }

    return deepSearchRenderVariable.call(this, msg, event);
  }

  renderStatement(statement, voxaEvent) {
    const tokenRegx = /{([\s\S]+?)}/g;
    _.templateSettings.interpolate = tokenRegx;
    const tokenKeys = _
      .uniq(statement.match(tokenRegx) || [])
      .map(str => str.substring(1, str.length - 1));

    const qVariables = _(this.config.variables)
    .toPairs()
    .filter(item => _.includes(tokenKeys, item[0]))
    .map(item => [item[0], Promise.try(() => item[1](voxaEvent.model, voxaEvent))])
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
