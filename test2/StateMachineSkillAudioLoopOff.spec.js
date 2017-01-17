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
      'AMAZON.LoopOffIntent': 'loopOff',
      'AMAZON.StopIntent': 'exit',
      'AMAZON.CancelIntent': 'exit',
    },
  },
  loopOff: {
    enter: function enter(request) {
      let index = 0;
      let shuffle = 0;
      const loop = 0;
      let offsetInMilliseconds = 0;

      if (request.context && request.context.AudioPlayer) {
        const token = JSON.parse(request.context.AudioPlayer.token);
        index = token.index;
        shuffle = token.shuffle;
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
  const token = {};
  token.index = index;
  token.shuffle = shuffle;
  token.loop = loop;

  return JSON.stringify(token);
}

const skill = new alexa.StateMachineSkill(appId, { responses, variables, Model, openIntent: 'LaunchIntent' });
_.map(states, (state, name) => {
  skill.onState(name, state);
});

let TEST_URLS = [
  'https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3',
];

describe('StateMachineSkill', () => {
  itIs('audioLoopOff', (res) => {
    expect(res.response.outputSpeech.ssml).to.include('Hello! Good');

    const token = JSON.parse(res.response.directives[0].audioItem.stream.token);
    expect(token.loop).to.equal(0, 'LOOP OFF');
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
