/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const Model = require('./model');
const expect = require('chai').expect;
const alexa = require('../');
const views = require('./views');
const variables = require('./variables');
const _ = require('lodash');

const appId = 'some-app-id';

const states = {
  entry: {
    to: {
      LaunchIntent: 'launch',
      'AMAZON.HelpIntent': 'help',
      'AMAZON.StopIntent': 'exit',
      'AMAZON.CancelIntent': 'exit',
    },
  },
  help: () => ({ reply: 'HelpIntent.HelpAboutSkill', to: 'die' }),
  exit: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
  die: { isTerminal: true },
  launch: () => ({ reply: 'LaunchIntent.OpenResponse', to: 'die' }),
};


describe('StateMachineSkill Help test', () => {
  let skill;

  beforeEach(() => {
    skill = new alexa.StateMachineSkill(appId, { views, variables, Model, openIntent: 'LaunchIntent' });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('help', (res) => {
    expect(res.response.outputSpeech.ssml).to.include('For more help visit');
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      event.session.application.applicationId = appId;
      return skill.execute(event).then(cb);
    });
  }
});
