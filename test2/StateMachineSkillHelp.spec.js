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
const responses = require('./responses');
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
  help: {
    enter: () => ({ reply: 'HelpIntent.HelpAboutSkill', to: 'die' }),
  },
  exit: {
    enter: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
  },
  die: { isTerminal: true },
  launch: {
    enter: () => ({ reply: 'LaunchIntent.OpenResponse', to: 'die' }),
  },
};


const skill = new alexa.StateMachineSkill(appId, { responses, variables, Model, openIntent: 'LaunchIntent' });
_.map(states, (state, name) => {
  skill.onState(name, state);
});

describe('StateMachineSkill Help test', () => {
  itIs('help', (res) => {
    expect(res.response.outputSpeech.ssml).to.include('For more help visit');
  });

  function itIs(requestFile, cb) {
    it(requestFile, (done) => {
      const event = require(`./requests/${requestFile}.js`);
      event.session.application.applicationId = appId;
      skill.execute(event, {
        succeed: function succeed(response) {
          try {
            cb(response);
          } catch (e) {
            return done(e);
          }

          return done();
        },

        fail: done,
      });
    });
  }
});
