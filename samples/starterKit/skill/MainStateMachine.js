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

const skill = new alexa.StateMachineSkill(appId, { openIntent: 'LaunchIntent', variables, responses, Model });
skill.onState('entry', {
  to: {
    LaunchIntent: 'launch',
    'AMAZON.HelpIntent': 'help',
  },
});

skill.onState('launch',  () => ({ reply: 'Intent.Launch', to: 'entry' }));
skill.onState('help',  () => ({ reply: 'Intent.Help', to: 'die' }));

module.exports = skill;
