'use strict';

const UserStorage = require('../services/userStorage');

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', (alexaEvent) => {
    if (alexaEvent.model.user && alexaEvent.model.user.id) {
      return { reply: 'Intent.Launch', to: 'entry' };
    }

    return { reply: 'Intent.NotAuthenticated', to: 'die' };
  });

  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help' }));

  skill.onRequestStarted((alexaEvent) => {
    if (!alexaEvent.session.user.accessToken) {
      return alexaEvent;
    }

    const storage = new UserStorage();

    return storage.get(alexaEvent.session.user.accessToken)
    .then((user) => {
      alexaEvent.model.user = user;
      return alexaEvent;
    });
  });
};
