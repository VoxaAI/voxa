'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const StateMachineSkill = require('../../lib/StateMachineSkill');
const badResponseReprompt = require('../../lib/plugins/reprompt-on-bad-response');
const views = require('../views');
const variables = require('../variables');

describe('BadResponseRepromptPlugin', () => {
  it('should send the last reprompt on UnhandledIntent', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
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
          reply: { msgPath: 'Playing.SayStop' },
        },
      },
    };

    badResponseReprompt(stateMachineSkill);
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Say stop if you want to finish the playback');
      });
  });

  it('should prepend the startView', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
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
          reply: { msgPath: 'Playing.SayStop' },
        },
      },
    };

    badResponseReprompt(stateMachineSkill, {
      startView: 'BadInput.RepeatLastAskReprompt',
    });
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.deep.equal(['I\'m sorry. I didn\'t understand.', 'Say stop if you want to finish the playback']);
      });
  });

  it('should just exit if no reprompt', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
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
        },
      },
    };

    badResponseReprompt(stateMachineSkill, {
      startView: 'BadInput.RepeatLastAskReprompt',
    });
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.deep.equal(['An unrecoverable error occurred.']);
      });
  });
});
