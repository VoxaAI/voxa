/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const expect = require('chai').expect;
const alexa = require('../');
const views = require('./views');
const variables = require('./variables');
const _ = require('lodash');
const Model = require('./model');

const appId = 'some-app-id';

const states = {
  entry: {
    to: {
      LaunchIntent: 'launch',
      'AMAZON.StopIntent': 'exit',
      'AMAZON.CancelIntent': 'exit',
    },
  },
  exit: {
    enter: function enter(request) {
      const directives = {};
      directives.type = 'AudioPlayer.Stop';
      return alexa.replyWithAudioDirectives('ExitIntent.Farewell', 'die', request,
        null, directives);
    },
  },
  die: { isTerminal: true },
  launch: {
    enter: function enter(request) {
      return alexa.replyWith('LaunchIntent.OpenResponse', 'die', request);
    },
  },
};

describe('StateMachineSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new alexa.StateMachineSkill(appId, { views, variables, Model, openIntent: 'LaunchIntent' });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('audioStop', (res) => {
    expect(res.response.outputSpeech.ssml).to.include('For more info visit');

    expect(res.response.directives[0].type).to.equal('AudioPlayer.Stop', 'AUDIO STOP');
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      event.context.System.application.applicationId = appId;
      return skill.execute(event).then(cb);
    });
  }
});
