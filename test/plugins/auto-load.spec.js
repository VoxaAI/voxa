'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const simple = require('simple-mock');
const StateMachineApp = require('../../lib/StateMachineApp');
const autoLoad = require('../../lib/plugins/auto-load');
const views = require('../views');
const variables = require('../variables');
const AutoLoadAdapter = require('./autoLoadAdapter');
const AlexaEvent = require('../../lib/adapters/alexa/AlexaEvent');

const adapter = new AutoLoadAdapter();

describe('AutoLoad plugin', () => {
  let event;

  beforeEach(() => {
    event = new AlexaEvent({
      session: {
        user: {
          userId: 'user-xyz',
        },
        new: true,
      },
      request: {
        locale: 'en-us',
        intent: {
          name: 'LaunchIntent',
        },
        type: 'IntentRequest',
      },
    });

    simple.mock(AutoLoadAdapter.prototype, 'get')
      .resolveWith({ Id: 1 });
  });

  afterEach(() => {
    simple.restore();
  });

  it('should get data from adapter', () => {
    const skill = new StateMachineApp({ variables, views });
    autoLoad(skill, { adapter });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.msg.statements).to.have.lengthOf(1);
        expect(result.msg.statements[0]).to.contain('Hello! Good');
        expect(result.session.attributes.model._state).to.equal('die');
        expect(result.session.attributes.model.user.Id).to.equal(1);
      });
  });

  it('should throw error on getting data from adapter', () => {
    const skill = new StateMachineApp({ variables, views });
    autoLoad(skill, { adapter });

    const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    simple.mock(adapter, 'get')
      .rejectWith(new Error('Random error'));

    return skill.execute(event)
      .then((reply) => {
        expect(reply.session.attributes).to.be.empty;
        expect(reply.error).to.not.be.undefined;
        expect(reply.error.message).to.equal('Random error');
      });
  });

  it('should throw an error when no config is provided', () => {
    const skill = new StateMachineApp({ variables, views });
    const fn = () => { autoLoad(skill); };

    expect(fn).to.throw('Missing config object');
  });

  it('should throw an error when no adapter is set up in the config object', () => {
    const skill = new StateMachineApp({ variables, views });
    const fn = () => { autoLoad(skill, {}); };

    expect(fn).to.throw('Missing adapter');
  });

  it('should not get data from adapter when adapter has an invalid GET function', () => {
    simple.mock(adapter, 'get', undefined);

    const skill = new StateMachineApp({ variables, views });
    const fn = () => { autoLoad(skill, { adapter }); };

    expect(fn).to.throw('No get method to fetch data from');
  });
});
