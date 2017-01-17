/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const assert = require('chai').assert;
const alexa = require('../');
const responses = require('./responses');
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
      'AMAZON.ShuffleOnIntent': 'shuffleOn',
      'AMAZON.StopIntent': 'exit',
      'AMAZON.CancelIntent': 'exit',
    },
  },
  shuffleOn: {
    enter: function enter(request, context) {
      let index = 0;
      const shuffle = 1;
      let loop = 0;
      let offsetInMilliseconds = 0;

      if (context && context.AudioPlayer) {
        const token = JSON.parse(context.AudioPlayer.token);
        index = token.index;
        loop = token.loop;
        offsetInMilliseconds = context.AudioPlayer.offsetInMilliseconds;
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
    enter: function enter(request, context) {
      return alexa.replyWith('ExitIntent.Farewell', 'die', request);
    },
  },
  die: { isTerminal: true },
  launch: {
    enter: function enter(request, context) {
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

const skill = new alexa.StateMachineSkill(appId, { responses, variables, Model });
_.map(states, (state, name) => {
  skill.onState(name, state);
});

describe('StateMachineSkill', () => {
  itIs('audioShuffleOn', (res) => {
    assert.include(res.response.outputSpeech.ssml, 'Hello! Good');

    const token = JSON.parse(res.response.directives[0].audioItem.stream.token);
    assert.equal(token.shuffle, 1, 'SHUFFLE ON');
  });

  function itIs(requestFile, cb) {
    it(requestFile, (done) => {
      const event = require(`./requests/${requestFile}.js`);
      event.context.System.application.applicationId = appId;
      skill.execute(event, {
        succeed(response) {
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
