/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const expect = require('chai').expect;
const Voxa = require('../');
const views = require('./views');
const variables = require('./variables');
const _ = require('lodash');

const states = {
  entry: {
    LaunchIntent: 'launch',
    'AMAZON.LoopOffIntent': 'loopOff',
    'AMAZON.StopIntent': 'exit',
    'AMAZON.CancelIntent': 'exit',
  },
  loopOff: function enter(request) {
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
  exit: function enter() {
    return { reply: 'ExitIntent.Farewell', to: 'die' };
  },
  die: { isTerminal: true },
  launch: function enter() {
    return { reply: 'LaunchIntent.OpenResponse', to: 'die' };
  },
};

function createToken(index, shuffle, loop) {
  return JSON.stringify({ index, shuffle, loop });
}

let TEST_URLS = [
  'https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3',
];

describe('StateMachineSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new Voxa({ views, variables });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('audioLoopOff', (reply) => {
    expect(reply.msg.statements[0]).to.include('Hello! Good');

    const token = JSON.parse(reply.msg.directives.token);
    expect(token.loop).to.equal(0, 'LOOP OFF');
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      return skill.execute(event).then(cb);
    });
  }
});
