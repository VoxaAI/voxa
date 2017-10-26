'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const simple = require('simple-mock');

const expect = chai.expect;
const StateMachineApp = require('../../lib/StateMachineApp');
const AlexaEvent = require('../../lib/adapters/alexa/AlexaEvent');
const replaceIntent = require('../../lib/plugins/replace-intent');
const views = require('../views');
const variables = require('../variables');

describe('ReplaceIntentPlugin', () => {
  it('should send to intent with Only', () => {
    const stateMachineSkill = new StateMachineApp({ variables, views });
    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    stateMachineSkill.onIntent('SomeIntent', spy);

    const event = new AlexaEvent({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeOnlyIntent',
        },
        locale: 'en-us',
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    });

    replaceIntent(stateMachineSkill);
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('SomeIntent');
        expect(reply.msg.statements[0]).to.include('Hello! Good ');
      });
  });


  it('shouldn\'t affect non matching intents', () => {
    const stateMachineSkill = new StateMachineApp({ variables, views });
    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    stateMachineSkill.onIntent('OnlySomeIntent', spy);

    const event = new AlexaEvent({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'OnlySomeIntent',
        },
        locale: 'en-us',
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    });

    replaceIntent(stateMachineSkill);
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('OnlySomeIntent');
        expect(reply.msg.statements[0]).to.include('Hello! Good ');
      });
  });

  it('should use provided regex', () => {
    const stateMachineSkill = new StateMachineApp({ variables, views });
    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    stateMachineSkill.onIntent('SomeHolderIntent', spy);

    const event = new AlexaEvent({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomePlaceholderIntent',
        },
        locale: 'en-us',
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    });

    replaceIntent(stateMachineSkill, { regex: /(.*)PlaceholderIntent$/, replace: '$1HolderIntent' });
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('SomeHolderIntent');
        expect(reply.msg.statements[0]).to.include('Hello! Good ');
      });
  });

  it('should use multiple regex', () => {
    const stateMachineSkill = new StateMachineApp({ variables, views });
    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    stateMachineSkill.onIntent('LongIntent', spy);

    const event = new AlexaEvent({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'VeryLongOnlyIntent',
        },
        locale: 'en-us',
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    });


    replaceIntent(stateMachineSkill, { regex: /(.*)OnlyIntent$/, replace: '$1Intent' });
    replaceIntent(stateMachineSkill, { regex: /^VeryLong(.*)/, replace: 'Long$1' });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LongIntent');
        expect(reply.msg.statements[0]).to.include('Hello! Good ');
      });
  });
});
