'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const StateMachineSkill = require('../../lib/StateMachineSkill');
const badResponseReprompt = require('../../lib/plugins/reprompt-on-bad-response');
const views = require('../views');
const Model = require('../model');
const variables = require('../variables');

describe('BadResponseRepromptPlugin', () => {
  it('should send the last reprompt on UnhandledIntent', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, views });
    stateMachineSkill.onIntent('entry', { });
    stateMachineSkill.onState('playing', (request) => {
      if (request.intent.name === 'AMAZON.StopIntent') {
        return { reply: 'ExitIntent.Farewell' };
      }

      return null;
    });

    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'AMAZON.YesIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
        attributes: {
          state: 'playing',
          reprompt: 'Playing.SayStop',
        },
      },
    };

    badResponseReprompt(stateMachineSkill, {
      startView: 'BadInput.RepeatLastAskReprompt',
      views,
    });
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.response.outputSpeech.ssml).to.equal('<speak>I\'m sorry. I didn\'t understand.\nSay stop if you want to finish the playback</speak>');
      });
  });
});
