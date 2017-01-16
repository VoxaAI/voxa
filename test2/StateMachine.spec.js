'use strict';

const expect = require('chai').expect;
const StateMachine = require('../lib2/StateMachine.js');
const Promise = require('bluebird');
const simple = require('simple-mock');
const variables = require('./variables');
const responses = require('./responses');
const MessageRenderer = require('alexa-helpers').messageRenderer;
const Model = require('./model');

describe('StateMachine', () => {
  let statesDefinition;
  let request;
  const messageRenderer = MessageRenderer(variables, responses);

  beforeEach(() => {
    request = {
      model: new Model(),
      intent: {

      },
      session: {
        attributes: {

        },
      },
    };
    statesDefinition = {
      entry: { enter: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }) },
      initState: { enter: () => ({ to: 'endState' }) },
      secondState: { enter: () => ({ to: 'initState' }) },
      thirdState: { enter: () => Promise.resolve({ to: 'endState' }) },
      endState: { enter: () => ({ reply: 'ExitIntent.Farewell'}) },
      simpleState: { to: { TestIntent: 'endState' } },
    };
  });

  it('should transition to endState', () => {
    const stateMachine = new StateMachine(statesDefinition, 'initState', [], messageRenderer);
    return stateMachine.transition(request)
      .then(() => {
        expect(stateMachine.currentState).to.equal(statesDefinition.endState);
      });
  });

  it('should transition more than one state', () => {
    const stateMachine = new StateMachine(statesDefinition, 'secondState', [], messageRenderer);
    return stateMachine.transition(request)
      .then(() => {
        expect(stateMachine.currentState).to.equal(statesDefinition.endState);
      });
  });

  it('should call onBeforeStateChangedCallbacks', () => {
    const onBeforeStateChanged = simple.stub();
    const stateMachine = new StateMachine(statesDefinition, 'secondState', [onBeforeStateChanged], messageRenderer);
    return stateMachine.transition(request)
      .then(() => {
        expect(onBeforeStateChanged.called).to.be.true;
        expect(onBeforeStateChanged.callCount).to.equal(3);
      });
  });

  it('should transition on promises change', () => {
    const stateMachine = new StateMachine(statesDefinition, 'thirdState', [], messageRenderer);
    return stateMachine.transition(request)
      .then(() => {
        expect(stateMachine.currentState).to.equal(statesDefinition.endState);
      });
  });

  it('should transition depending on intent if state.to ', () => {
    const stateMachine = new StateMachine(statesDefinition, 'simpleState', [],messageRenderer);
    request.intent.name = 'TestIntent';
    return stateMachine.transition(request)
      .then(() => {
        expect(stateMachine.currentState).to.equal(statesDefinition.endState);
      });
  });

  it('should throw an exception on invalid state  ', () => {
    const stateMachine = new StateMachine(statesDefinition, 'simpleState');
    return stateMachine.transition({ intent: { name: 'OtherIntent' } })
      .then(() => { throw new Error('this should have failed'); })
      .catch((err) => {
        expect(err.message).to.equal('Unsupported intent for state OtherIntent');
        expect(err).to.be.an('error');
      });
  });


  it('should fail if there\'s no entry state', () => {
    expect(() => new StateMachine({}, 'initState')).to.throw('State machine must have a `entry` state.');
  });
});
