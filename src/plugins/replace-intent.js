'use strict';

const _ = require('lodash');

const defaultConfig = {
  regex: /(.*)OnlyIntent$/,
  replace: '$1Intent',
};

function register(skill, config) {
  const pluginConfig = _.merge({}, defaultConfig, config);
  skill.onIntentRequest((voxaEvent) => {
    const intentName = voxaEvent.intent.name;
    voxaEvent.intent.name = intentName.replace(pluginConfig.regex, pluginConfig.replace);
  });
}
module.exports = register;
