'use strict';

const chai = require('chai');
const expect = chai.expect;
const simple = require('simple-mock');
const StateMachineApp = require('../../src/VoxaApp').VoxaApp;
const autoLoad = require('../../src/plugins/auto-load').autoLoad;
const views = require('../views').views;
const variables = require('../variables').variables;
const AutoLoadAdapter = require('./autoLoadAdapter').AutoLoadAdapter;
const AlexaEvent = require('../../src/platforms/alexa/AlexaEvent').AlexaEvent;
const AlexaPlatform = require('../../src/platforms/alexa/AlexaPlatform').AlexaPlatform;
const AlexaReply = require('../../src/platforms/alexa/AlexaReply').AlexaReply;


describe('AutoLoad plugin', () => {
  let event;
  let adapter;

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

    adapter = new AutoLoadAdapter();
  });

  afterEach(() => {
    simple.restore();
  });

  it('should get data from adapter', () => {
    const skill = new StateMachineApp({ variables, views });
    autoLoad(skill, { adapter });

    const spy = simple.spy(() => ({ ask: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);
    const platform = new AlexaPlatform(skill)

    return platform.execute(event)
      .then((result) => {
        expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
        expect(result.response.outputSpeech.ssml).to.include("Hello! Good");
        expect(result.sessionAttributes.state).to.equal('die');
        expect(result.sessionAttributes.model.user.Id).to.equal(1);
      });
  });

  it('should throw error on getting data from adapter', () => {
    const skill = new StateMachineApp({ variables, views });
    autoLoad(skill, { adapter });

    const spy = simple.spy(() => ({ ask: 'LaunchIntent.OpenResponse' }));
    skill.onIntent('LaunchIntent', spy);

    simple.mock(adapter, 'get')
      .rejectWith(new Error('Random error'));

    const platform = new AlexaPlatform(skill)

    return platform.execute(event, {})
      .then((reply) => {
        expect(reply.speech).to.equal('<speak>An unrecoverable error occurred.</speak>')
        // expect(reply.error).to.not.be.undefined;
        // expect(reply.error.message).to.equal('Random error');
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
