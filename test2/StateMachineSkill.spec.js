'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const simple = require('simple-mock');
const StateMachineSkill = require('../lib2/StateMachineSkill.js');
const Promise = require('bluebird');
const _ = require('lodash');
const responses = require('./responses');
const variables = require('./variables');
const Model = require('./model');

describe('StateMachineSkill', () => {
  let statesDefinition;
  let event;

  beforeEach(() => {
    event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
    };

    statesDefinition = {
      entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      initState: () => ({ to: 'endState' }),
      secondState: () => ({ to: 'initState' }),
      thirdState: () => Promise.resolve({ to: 'endState' }),
    };
  });

  it('should accept new states', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, responses, openIntent: 'LaunchIntent' });
    const fourthState = () => ({ to: 'endState' });
    stateMachineSkill.onState('fourthState', fourthState);
    expect(stateMachineSkill.states.fourthState.enter).to.equal(fourthState);
  });

  it('should accept onBeforeStateChanged callbacks', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, responses, openIntent: 'LaunchIntent' });
    stateMachineSkill.onBeforeStateChanged(simple.stub());
  });

  it('should call the entry state on a new session', () => {
    statesDefinition.entry = simple.stub().resolveWith({
      reply: 'ExitIntent.Farewell',
    });

    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, responses, openIntent: 'LaunchIntent' });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));

    return stateMachineSkill.execute(event, context)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  it('should throw an error if required properties missing from config', () => {
    expect(() => new StateMachineSkill('appId', { })).to.throw(Error, 'Config should include a model');
    expect(() => new StateMachineSkill('appId', { Model: { } })).to.throw(Error, 'Model should have a fromRequest method');
    expect(() => new StateMachineSkill('appId', { Model: { fromRequest: () => {} } })).to.throw(Error, 'Model should have a serialize method');
    expect(() => new StateMachineSkill('appId', { Model: { fromRequest: () => {}, serialize: () => {} } })).to.throw(Error, 'Config should include variables');
    expect(() => new StateMachineSkill('appId', { Model, variables })).to.throw(Error, 'Config should include responses');
    expect(() => new StateMachineSkill('appId', { Model, variables, responses })).to.throw(Error, 'Config should include openIntent');
    expect(() => new StateMachineSkill('appId', { Model, variables, responses, openIntent: 'LaunchIntent' })).to.not.throw(Error);
  });

  it('should set properties on request and have those available in the state callbacks', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, responses, variables, openIntent: 'LaunchIntent' });
    statesDefinition.entry = (request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(Model);

      return { reply: 'ExitIntent.Farewell', to: 'die' };
    };

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event, context);
  });

  it('should call onBeforeReplySent callbacks', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, responses, variables, openIntent: 'LaunchIntent' });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    const onBeforeReplySent = simple.stub();
    stateMachineSkill.onBeforeReplySent(onBeforeReplySent);

    return stateMachineSkill.execute(event, context)
      .then(() => {
        console.dir(onBeforeReplySent.lastCall.args[2]);
        expect(onBeforeReplySent.called).to.be.true;
      });
  });

  it('should call entry on a LaunchRequest', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, responses, variables, openIntent: 'LaunchIntent' });

    event.request.type = 'LaunchRequest';
    statesDefinition.entry = simple.stub().resolveWith({
      to: 'die',
    });

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event, context)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });
});

