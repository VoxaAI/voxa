/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const expect = require('chai').expect;
const Voxa = require('../src/VoxaApp').VoxaApp;
const views = require('./views').views;
const variables = require('./variables');
const _ = require('lodash');
const AlexaEvent = require('../src/platforms/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../src/platforms/alexa/AlexaReply').AlexaReply;
const tools = require('./tools');

const rb = new tools.AlexaRequestBuilder();

const states = {
  entry: {
    LaunchIntent: 'launch',
    HelpIntent: 'help',
    StopIntent: 'exit',
    CancelIntent: 'exit',
  },
  help: () => ({ reply: 'HelpIntent.HelpAboutSkill', to: 'die' }),
  exit: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
  launch: () => ({ reply: 'LaunchIntent.OpenResponse', to: 'die' }),
};


describe('StateMachineSkill Help test', () => {
  let skill;

  beforeEach(() => {
    skill = new Voxa({ views, variables });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('AMAZON.HelpIntent', (reply) => {
    expect(reply.response.statements[0]).to.include('For more help visit');
  });

  function itIs(intentName, cb) {
    it(intentName, () => {
      const event = new AlexaEvent(rb.getIntentRequest(intentName));
      return skill.execute(event, AlexaReply).then(cb);
    });
  }
});
