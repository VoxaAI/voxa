/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const expect = require('chai').expect;
const alexa = require('../');
const responses = require('./responses');
const variables = require('./variables');
const _ = require('lodash');
const Model = require('./model');

const appId = 'some-app-id';

const states = {
  entry: {
    to: {
      LaunchIntent: 'launch',
      'AMAZON.PauseIntent': 'pause',
      'AMAZON.StopIntent': 'exit',
      'AMAZON.CancelIntent': 'exit',
    },
  },
  pause: {
    enter: () => ({ reply: 'LaunchIntent.OpenResponse', to: 'die' }),
  },
  exit: {
    enter: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
  },
  die: { isTerminal: true },
  launch: {
    enter: () => ({ reply: 'LaunchIntent.OpenResponse', to: 'die' }),
  },
};

describe('StateMachineSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new alexa.StateMachineSkill(appId, { responses, variables, Model, openIntent: 'LaunchIntent' });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('audioPause', (res) => {
    expect(res.response.outputSpeech.ssml).to.include('Hello! Good');
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      event.context.System.application.applicationId = appId;
      return skill.execute(event).then(cb);
    });
  }
});
