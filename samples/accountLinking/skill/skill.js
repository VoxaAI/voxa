'use strict';

// Include the state machine module and the replyWith function
const alexa = require('alexa-statemachine');
const appId = require('../config').alexa.appId;
const views = require('./views');
const variables = require('./variables');
const UserStorage = require('../services/userStorage');
const Model = require('../services/model');

const skill = new alexa.StateMachineSkill(appId, { variables, views, Model });
skill.onState('entry', {
  to: {
    LaunchIntent: 'launch',
    'AMAZON.HelpIntent': 'help',
  },
});

skill.onState('launch', () => ({ reply: 'Intent.Launch', to: 'entry' }));

skill.onState('help', () => ({ reply: 'Intent.Help', to: 'die' }));

skill.onRequestStarted((request) => {
  if (!request.session.user.accessToken) {
    return null;
  }
  const storage = new UserStorage();

  return storage.get(request.session.user.accessToken)
    .then((user) => {
      request.model.user = user;
      return null;
    });
});

module.exports = skill;
