'use strict';

const expect = require('chai').expect;
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
      entry: { enter: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }) },
      initState: { enter: () => ({ to: 'endState' }) },
      secondState: { enter: () => ({ to: 'initState' }) },
      thirdState: { enter: () => Promise.resolve({ to: 'endState' }) },
      endState: { enter: () => ({ reply: 'ExitIntent.Farewell'}) },
    };
  });

  it('should accept new states', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, responses });
    function fourthState() { return { to: 'endState' }; }
    stateMachineSkill.onState(fourthState, 'fourthState');
    expect(stateMachineSkill.states.fourthState).to.equal(fourthState);
  });

  it('should accept onBeforeStateChanged callbacks', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, responses });
    stateMachineSkill.onBeforeStateChanged(simple.stub());
  });

  it('should call the entry state on a new session', (done) => {
    statesDefinition.entry = { enter: simple.stub().returnWith({
      reply: 'ExitIntent.Farewell',
    }) };
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, responses });
    _.map(statesDefinition, (state, stateName) => stateMachineSkill.onState(state, stateName));

    const context = {
      succeed: (data) => {
        expect(statesDefinition.entry.enter.called).to.be.true;
        console.log(data)
        done();
      },
      fail: done,
    };

    stateMachineSkill.execute(event, context);
  });

  it('should throw an error if required properties missing from config', () => {
    expect(() => new StateMachineSkill('appId', { })).to.throw(Error);
    expect(() => new StateMachineSkill('appId', { Model: { } })).to.throw(Error); // missing from request
    expect(() => new StateMachineSkill('appId', { Model })).to.throw(Error); // missing variables
    expect(() => new StateMachineSkill('appId', { Model, variables })).to.throw(Error); // missing responses
    expect(() => new StateMachineSkill('appId', { Model, variables, responses })).to.not.throw(Error); // all in there
  });

  it('should set properties on request and have those available in the state callbacks', (done) => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, responses, variables });
    statesDefinition.entry = { enter: (request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(Model);
    } };

    _.map(statesDefinition, (state, stateName) => stateMachineSkill.onState(state, stateName));

    const context = {
      succeed: () => done(),
      fail: done,
    };

    stateMachineSkill.execute(event, context);
  });
});

