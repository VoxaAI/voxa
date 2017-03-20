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
};
