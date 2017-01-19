'use strict';

const expect = require('chai').expect;
const StateMachine = require('../lib2/StateMachine.js');
const Promise = require('bluebird');
const simple = require('simple-mock');
const variables = require('./variables');
const responses = require('./responses');
const Model = require('./model');

describe('StateMachine', () => {
  let states;
  let request;

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
    states = {
      entry: { enter: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }), name: 'entry' },
      initState: { enter: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }), name: 'initState' },
      secondState: { enter: () => ({ to: 'initState' }), name: 'secondState' },
      thirdState: { enter: () => Promise.resolve({ to: 'die' }), name: 'thirdState' },
      simpleState: { to: { TestIntent: 'die' }, name: 'simpleState' },
    };
  });

  it('should transition to die', () => {
    const stateMachine = new StateMachine('initState', { states });
    return stateMachine.transition(request)
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should transition more than one state', () => {
    const stateMachine = new StateMachine('secondState', { states });
    return stateMachine.transition(request)
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should call onBeforeStateChangedCallbacks', () => {
    const onBeforeStateChanged = simple.stub();
    const stateMachine = new StateMachine('secondState', { onBeforeStateChanged: [onBeforeStateChanged], states });
    return stateMachine.transition(request)
      .then(() => {
        expect(onBeforeStateChanged.called).to.be.true;
        expect(onBeforeStateChanged.callCount).to.equal(2);
      });
  });

  it('should transition on promises change', () => {
    const stateMachine = new StateMachine('thirdState', { states });
    return stateMachine.transition(request)
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should transition depending on intent if state.to ', () => {
    const stateMachine = new StateMachine('simpleState', { states });
    request.intent.name = 'TestIntent';
    return stateMachine.transition(request)
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should throw an exception on invalid state  ', () => {
    const stateMachine = new StateMachine('simpleState', { states });
    return stateMachine.transition({ intent: { name: 'OtherIntent' } })
      .then(() => { throw new Error('this should have failed'); })
      .catch((err) => {
        expect(err.message).to.equal('Unsupported intent for state OtherIntent');
        expect(err).to.be.an('error');
      });
  });


  it('should fail if there\'s no entry state', () => {
    expect(() => new StateMachine('initState', { states: {} })).to.throw('State machine must have a `entry` state.');
  });
});
