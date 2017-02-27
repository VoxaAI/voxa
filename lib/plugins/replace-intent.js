'use strict';

const _ = require('lodash');

const defaultConfig = {
  regex: /(.*)OnlyIntent$/,
  replace: '$1Intent',
};

function register(skill, config) {
  const pluginConfig = _.merge({}, defaultConfig, config);
  skill.onIntentRequest((request) => {
    request.intent.name = request.intent.name.replace(pluginConfig.regex, pluginConfig.replace);
  });
}
module.exports = register;
