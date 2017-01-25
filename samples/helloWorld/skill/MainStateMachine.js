'use strict';

// Include the state machine module and the replyWith function
const alexa = require('alexa-statemachine');
const appId = require('../config').alexa.appId;
const views = require('./views');
const variables = require('./variables');
const _ = require('lodash');

class Model {
  constructor(data) {
    _.assign(this, data);
  }

  static fromRequest(request) {
    return new Model(request.session.attributes.data);
  }

  serialize() {
    const ret = _.omit(this, 'user', 'q', 'pruned', 'analytics');

    return ret;
  }
}

const skill = new alexa.StateMachineSkill(appId, { views, variables, Model, openIntent: 'LaunchIntent' });

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
