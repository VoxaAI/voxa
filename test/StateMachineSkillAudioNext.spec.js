/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const assert = require('chai').assert;
const alexa = require('../');
const views = require('./views');
const variables = require('./variables');
const _ = require('lodash');
const Model = require('./model');

const appId = 'some-app-id';
const TEST_URLS = [
  'https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3',
];

const states = {
  entry: {
    to: {
      LaunchIntent: 'launch',
      'AMAZON.NextIntent': 'next',
      'AMAZON.StopIntent': 'exit',
      'AMAZON.CancelIntent': 'exit',
    },
  },
  next: {
    enter: function enter(request) {
      let index = 0;
      let shuffle = 0;
      let loop = 0;

      if (request.context && request.context.AudioPlayer) {
        const token = JSON.parse(request.context.AudioPlayer.token);
        index = token.index + 1;
        shuffle = token.shuffle;
        loop = token.loop;
      }

      if (index === TEST_URLS.length) {
        index = 0;
      }

      const directives = {};
      directives.type = 'AudioPlayer.Play';
      directives.playBehavior = 'REPLACE_ALL';
      directives.token = createToken(index, shuffle, loop);
      directives.url = TEST_URLS[index];
      directives.offsetInMilliseconds = 0;

      return { reply: 'LaunchIntent.OpenResponse', to: 'die', directives };
    },
  },
  exit: {
    enter: function enter() {
      return { reply: 'ExitIntent.Farewell', to: 'die' };
    },
  },
  die: { isTerminal: true },
  launch: {
    enter: function enter() {
      return { reply: 'LaunchIntent.OpenResponse', to: 'die' };
    },
  },
};

function createToken(index, shuffle, loop) {
  return JSON.stringify({ index, shuffle, loop });
}

describe('StateMachineSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new alexa.StateMachineSkill(appId, { views, variables, Model, openIntent: 'LaunchIntent' });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('audioNext', (res) => {
    assert.include(res.response.outputSpeech.ssml, 'Hello! Good');

    const token = JSON.parse(res.response.directives[0].audioItem.stream.token);
    assert.equal(token.index, 2, 'AUDIO INDEX 2');
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      event.context.System.application.applicationId = appId;
      return skill.execute(event).then(cb);
    });
  }
});
