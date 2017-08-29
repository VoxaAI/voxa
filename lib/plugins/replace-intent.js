'use strict';

const _ = require('lodash');

const defaultConfig = {
  regex: /(.*)OnlyIntent$/,
  replace: '$1Intent',
};

function register(skill, config) {
  const pluginConfig = _.merge({}, defaultConfig, config);
  skill.onIntentRequest((alexaEvent) => {
    const intentName = alexaEvent.intent.name;
    alexaEvent.intent.name = intentName.replace(pluginConfig.regex, pluginConfig.replace);
  });
}
module.exports = register;
