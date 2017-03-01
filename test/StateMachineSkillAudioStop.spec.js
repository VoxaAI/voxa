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
    'AMAZON.StopIntent': 'exit',
    'AMAZON.CancelIntent': 'exit',
  },
  exit: function enter(request) {
    const directives = {};
    directives.type = 'AudioPlayer.Stop';
    return { reply: 'ExitIntent.Farewell', directives };
  },
  launch: function enter(request) {
    return { reply: 'LaunchIntent.OpenResponse' };
  },
};

describe('StateMachineSkill', () => {
  let skill;

  beforeEach(() => {
    skill = new Voxa({ views, variables });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs('audioStop', (reply) => {
    expect(reply.msg.statements[0]).to.include('For more info visit');

    expect(reply.msg.directives).to.deep.equal({ type: 'AudioPlayer.Stop' });
  });

  function itIs(requestFile, cb) {
    it(requestFile, () => {
      const event = require(`./requests/${requestFile}.js`);
      return skill.execute(event).then(cb);
    });
  }
});
