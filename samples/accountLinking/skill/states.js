'use strict';

const UserStorage = require('../services/userStorage');

exports.register = function register(skill) {
  skill.onIntent('LaunchIntent', (request) => {
    if (request.model.user && request.model.user.id) {
      return { reply: 'Intent.Launch', to: 'entry' };
    }

    return { reply: 'Intent.NotAuthenticated', to: 'die' };
  });

  skill.onIntent('AMAZON.HelpIntent', () => ({ reply: 'Intent.Help' }));

  skill.onRequestStarted((request) => {
    if (!request.session.user.accessToken) {
      return request;
    }

    const storage = new UserStorage();

    return storage.get(request.session.user.accessToken)
    .then((user) => {
      request.model.user = user;
      return request;
    });
  });
};
