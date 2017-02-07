'use strict';

const Promise = require('bluebird');
const _ = require('lodash');
const template = require('alexa-helpers').template;

module.exports = {
  name: 'variableRenderer',
  type: 'postProcessor',

  options: { },

  setOptions: function setOptions(options) {
    this.options = _.merge(this.options, options);
  },

  process: function process(value, key, options) {
    const tokens = template.tokens(value);
    const renderedVars = _.map(tokens, (token) => {
      const variable = this.options.variables[token];
      if (!variable) throw new Error(`No such variable ${token}`);
      return variable(this.options.model);
    });

    const tokensWithVars = _.zip(tokens, renderedVars);
    const data = _.fromPairs(tokensWithVars);
    return template(value, data);
  },
};
