'use strict';

const _ = require('lodash');
const UserStorage = require('../services/userStorage');

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', (alexaEvent) => {
    if (_.get(alexaEvent, 'model.email')) {
      return { reply: 'Intent.Launch', to: 'entry' };
    }

    return { reply: 'Intent.NotAuthenticated', to: 'die' };
  });

  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help' }));
};
