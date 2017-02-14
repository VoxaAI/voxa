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
    LaunchIntent: 'launch',
    'AMAZON.ShuffleOnIntent': 'shuffleOn',
    'AMAZON.StopIntent': 'exit',
    'AMAZON.CancelIntent': 'exit',
  },
  shuffleOn: function enter(request) {
    let index = 0;
    const shuffle = 1;
    let loop = 0;
    let offsetInMilliseconds = 0;

    if (request.context && request.context.AudioPlayer) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      index = token.index;
      loop = token.loop;
      offsetInMilliseconds = request.context.AudioPlayer.offsetInMilliseconds;
    }

    const directives = {};
    directives.type = 'AudioPlayer.Play';
    directives.playBehavior = 'REPLACE_ALL';
    directives.token = createToken(index, shuffle, loop);
    directives.url = TEST_URLS[index];
    directives.offsetInMilliseconds = offsetInMilliseconds;

    return { reply: 'LaunchIntent.OpenResponse', to: 'die', directives };
  },
  exit: function enter(request) {
    return alexa.replyWith('ExitIntent.Farewell', 'die', request);
  },
  launch: function enter(request) {
    return alexa.replyWith('LaunchIntent.OpenResponse', 'die', request);
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

  itIs('audioShuffleOn', (res) => {
    assert.include(res.response.outputSpeech.ssml, 'Hello! Good');

    const token = JSON.parse(res.response.directives[0].audioItem.stream.token);
    assert.equal(token.shuffle, 1, 'SHUFFLE ON');
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      event.context.System.application.applicationId = appId;
      return skill.execute(event).then(cb);
    });
  }
});
