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
const AlexaEvent = require('../lib/adapters/alexa/AlexaEvent');
const tools = require('./tools');

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

    const directives = {};
    directives.type = 'AudioPlayer.Play';
    directives.playBehavior = 'REPLACE_ALL';
    directives.token = createToken(index, shuffle, loop);
    directives.url = TEST_URLS[index];
    directives.offsetInMilliseconds = offsetInMilliseconds;

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
    expect(reply.msg.statements.join()).to.include('Hello! Good');
    expect(reply.msg.directives[0].type).to.equal('AudioPlayer.Play');
    expect(reply.msg.directives[0].playBehavior).to.equal('REPLACE_ALL');
    expect(reply.msg.directives[0].audioItem.stream.offsetInMilliseconds).to.equal(353160);
  });

  function itIs(intentName, cb) {
    it(intentName, () => {
      const event = new AlexaEvent(rb.getIntentRequest(intentName));
      event.context.AudioPlayer = {
        offsetInMilliseconds: 353160,
        token: '{"index":1,"shuffle":1,"loop":0}',
        playerActivity: 'STOPPED',
      };

      return skill.execute(event).then(cb);
    });
  }
});
