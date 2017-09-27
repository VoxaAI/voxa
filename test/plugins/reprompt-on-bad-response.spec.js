'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const StateMachineApp = require('../../lib/StateMachineApp');
const badResponseReprompt = require('../../lib/plugins/reprompt-on-bad-response');
const views = require('../views');
const variables = require('../variables');
const AlexaEvent = require('../../lib/adapters/alexa/AlexaEvent');

describe('BadResponseRepromptPlugin', () => {
  it('should send the last reprompt on UnhandledIntent', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('entry', { });
    stateMachineApp.onState('playing', (request) => {
      if (request.intent.name === 'AMAZON.StopIntent') {
        return { reply: 'ExitIntent.Farewell' };
      }

      return null;
    });

    const event = new AlexaEvent({
      request: {
        locale: 'en-us',
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
    });

    badResponseReprompt(stateMachineApp);
    return stateMachineApp.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Say stop if you want to finish the playback');
      });
  });

  it('should prepend the startView', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('entry', { });
    stateMachineApp.onState('playing', (request) => {
      if (request.intent.name === 'AMAZON.StopIntent') {
        return { reply: 'ExitIntent.Farewell' };
      }

      return null;
    });

    const event = new AlexaEvent({
      request: {
        locale: 'en-us',
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
    });

    badResponseReprompt(stateMachineApp, {
      startView: 'BadInput.RepeatLastAskReprompt',
    });
    return stateMachineApp.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.deep.equal(['I\'m sorry. I didn\'t understand.', 'Say stop if you want to finish the playback']);
      });
  });

  it('should add a reply to session if reply is an ask', () => {
    const skill = new StateMachineApp({ views, variables });
    skill.onIntent('AskIntent', () => ({ to: 'exit', reply: 'Question.Ask' }));
    skill.onState('exit', () => 'ExitIntent.Farewell');

    const event = new AlexaEvent({
      request: {
        locale: 'en-us',
        type: 'IntentRequest',
        intent: {
          name: 'AskIntent',
        },
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
        attributes: {
          reply: { msgPath: 'Playing.SayStop' },
        },
      },
    });

    badResponseReprompt(skill);
    return skill.execute((event))
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(reply.session.attributes.reply).to.deep.equal({
          msgPath: 'Question.Ask',
          state: 'exit',
        });
      });
  });


  it('should just exit if no reprompt', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('entry', { });
    stateMachineApp.onState('playing', (request) => {
      if (request.intent.name === 'AMAZON.StopIntent') {
        return { reply: 'ExitIntent.Farewell' };
      }

      return null;
    });

    const event = new AlexaEvent({
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
    });

    badResponseReprompt(stateMachineApp, {
      startView: 'BadInput.RepeatLastAskReprompt',
    });
    return stateMachineApp.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.deep.equal(['An unrecoverable error occurred.']);
      });
  });
});
