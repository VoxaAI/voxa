'use strict';

// Include the state machine module and the replyWith function
const alexa = require('alexa-statemachine');
const appId = require('../config').alexa.appId;
const responses = require('./responses');
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

const skill = new alexa.StateMachineSkill(appId, { responses, variables, Model, openIntent: 'LaunchIntent' });
module.exports = skill;

skill.onState('entry', {
  to: {
    LaunchIntent: 'launch',
    HelloWorldIntent: 'helloWorld',
    'AMAZON.HelpIntent': 'help',
  },
});

skill.onState('launch', {
  enter: () => ({ reply: 'Intent.Launch', to: 'entry' }),
});

skill.onState('helloWorld', {
  enter: () => ({ reply: 'Intent.HelloWorld', to: 'die' }),
});

skill.onState('help', {
  enter: () => ({ reply: 'Intent.Help', to: 'entry' }),
});
