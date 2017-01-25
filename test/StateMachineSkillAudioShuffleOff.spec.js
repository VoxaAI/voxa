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
const TEST_URLS = [
  'https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3',
];

const states = {
  entry: {
    to: {
      LaunchIntent: 'launch',
      'AMAZON.ShuffleOffIntent': 'shuffleOff',
      'AMAZON.StopIntent': 'exit',
      'AMAZON.CancelIntent': 'exit',
    },
  },
  shuffleOff: {
    enter: function enter(request) {
      let index = 0;
      const shuffle = 0;
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

      return alexa.replyWithAudioDirectives('LaunchIntent.OpenResponse', 'die', request,
        null, directives);
    },
  },
  exit: {
    enter: function enter(request) {
      return alexa.replyWith('ExitIntent.Farewell', 'die', request);
    },
  },
  die: { isTerminal: true },
  launch: {
    enter: function enter(request) {
      return alexa.replyWith('LaunchIntent.OpenResponse', 'die', request);
    },
  },
};

function createToken(index, shuffle, loop) {
  const token = {};
  token.index = index;
  token.shuffle = shuffle;
  token.loop = loop;

  return JSON.stringify(token);
}

describe('StateMachineSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new alexa.StateMachineSkill(appId, { views, variables, Model, openIntent: 'LaunchIntent' });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('audioShuffleOff', (res) => {
    expect(res.response.outputSpeech.ssml).to.include('Hello! Good');

    const token = JSON.parse(res.response.directives[0].audioItem.stream.token);
    expect(token.shuffle).to.equal(0, 'SHUFFLE OFF');
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      event.context.System.application.applicationId = appId;
      return skill.execute(event).then(cb);
    });
  }
});
