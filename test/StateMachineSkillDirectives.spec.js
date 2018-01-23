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
const variables = require('./variables').variables;
const _ = require('lodash');
const AlexaEvent = require('../src/platforms/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../src/platforms/alexa/AlexaReply').AlexaReply;
const tools = require('./tools');

const playAudio = require('../src/platforms/alexa/directives').playAudio;

const rb = new tools.AlexaRequestBuilder();

const TEST_URLS = [
  'https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3',
  'https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3',
];

const states = {
  entry: {
    LaunchIntent: 'launch',
    ResumeIntent: 'resume',
    StopIntent: 'exit',
    CancelIntent: 'exit',
  },
  resume: function enter(request) {
    let index = 0;
    let shuffle = 0;
    let loop = 0;
    let offsetInMilliseconds = 0;

    if (request.context && request.context.AudioPlayer) {
      const token = JSON.parse(request.context.AudioPlayer.token);
      index = token.index;
      shuffle = token.shuffle;
      loop = token.loop;
      offsetInMilliseconds = request.context.AudioPlayer.offsetInMilliseconds;
    }

    const directives = [playAudio(TEST_URLS[index], createToken(index, shuffle, loop), offsetInMilliseconds, 'REPLACE_ALL')]

    return { reply: 'LaunchIntent.OpenResponse', directives };
  },
  exit: function enter() {
    return { reply: 'ExitIntent.Farewell' };
  },
  launch: function enter() {
    return { reply: 'LaunchIntent.OpenResponse' };
  },
};

function createToken(index, shuffle, loop) {
  return JSON.stringify({ index, shuffle, loop });
}

describe('StateMachineApp', () => {
  let skill;

  beforeEach(() => {
    skill = new Voxa({ views, variables });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('ResumeIntent', (reply) => {
    expect(reply.response.statements.join()).to.include('Hello! Good');
    expect(reply.response.directives[0].type).to.equal('AudioPlayer.Play');
    expect(reply.response.directives[0].playBehavior).to.equal('REPLACE_ALL');
    expect(reply.response.directives[0].audioItem.stream.offsetInMilliseconds).to.equal(353160);
  });

  function itIs(intentName, cb) {
    it(intentName, () => {
      const event = new AlexaEvent(rb.getIntentRequest(intentName));
      event.context.AudioPlayer = {
        offsetInMilliseconds: 353160,
        token: '{"index":1,"shuffle":1,"loop":0}',
        playerActivity: 'STOPPED',
      };

      return skill.execute(event, AlexaReply).then(cb);
    });
  }
});
