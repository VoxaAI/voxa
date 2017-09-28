'use strict';

const _ = require('lodash');

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', (alexaEvent) => {
    if (_.get(alexaEvent, 'model.user.email')) {
      return { reply: 'Intent.Launch', to: 'entry' };
    }

    return { reply: 'Intent.NotAuthenticated', to: 'die' };
  });

  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help' }));
  
  skill['onAlexaSkillEvent.SkillEnabled']((alexaEvent, reply) => {
    const userId = alexaEvent.user.userId;
    const timestamp = alexaEvent.request.timestamp;
    console.log(`skill was enabled for user: ${userId} at ${timestamp}`);
    return reply;
  });

  skill['onAlexaSkillEvent.SkillAccountLinked']((alexaEvent, reply) => {
    const userId = alexaEvent.user.userId;
    const accessToken = alexaEvent.request.body.accessToken;
    console.log(`User: ${userId} link his account. Access Token is ${accessToken}`);
    return reply;
  });
};
