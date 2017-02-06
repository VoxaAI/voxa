'use strict';

const alexa = require('alexa-statemachine');
const appId = require('../config').alexa.appId;
const views = require('./views');
const variables = require('./variables');
const Model = require('../services/model');

const skill = new alexa.StateMachineSkill(appId, { views, variables, Model });

skill.onState('entry', {
  to: {
    LaunchIntent: 'launch',
    HelloWorldIntent: 'helloWorld',
    'AMAZON.HelpIntent': 'help',
  },
});

skill.onState('launch', () => ({ reply: 'Intent.Launch', to: 'entry' }));
skill.onState('helloWorld', () => ({ reply: 'Intent.HelloWorld', to: 'die' }));
skill.onState('help', () => ({ reply: 'Intent.Help', to: 'entry' }));

module.exports = skill;
