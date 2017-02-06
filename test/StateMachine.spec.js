'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const StateMachine = require('../lib/StateMachine.js');
const errors = require('../lib/Errors');
const Reply = require('../lib/Reply');
const Promise = require('bluebird');
const simple = require('simple-mock');
const BadTransition = require('../lib/Errors').BadTransition;
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
    };
  });

  it('should store the execution flow in the request', () => {
    const stateMachine = new StateMachine('secondState', { states });
    return stateMachine.transition(request, new Reply(request))
      .then(() => {
        expect(request.flow).to.deep.equal(['secondState', 'initState', 'die']);
      });
  });

  it('should transition to die', () => {
    const stateMachine = new StateMachine('initState', { states });
    return stateMachine.transition(request, new Reply(request))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should transition more than one state', () => {
    const stateMachine = new StateMachine('secondState', { states });
    return stateMachine.transition(request, new Reply(request))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should call onBeforeStateChangedCallbacks', () => {
    const onBeforeStateChanged = simple.stub();
    const stateMachine = new StateMachine('secondState', { onBeforeStateChanged: [onBeforeStateChanged], states });
    return stateMachine.transition(request, new Reply(request))
      .then(() => {
        expect(onBeforeStateChanged.called).to.be.true;
        expect(onBeforeStateChanged.callCount).to.equal(2);
      });
  });

  it('should transition on promises change', () => {
    const stateMachine = new StateMachine('thirdState', { states });
    return stateMachine.transition(request, new Reply(request))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should transition depending on intent if state.to ', () => {
    states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
    const stateMachine = new StateMachine('entry', { states });
    request.intent.name = 'TestIntent';
    return stateMachine.transition(request, new Reply(request))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should throw an exception on invalid state  ', () => {
    states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
    const stateMachine = new StateMachine('entry', { states });
    const promise = stateMachine.transition({ intent: { name: 'OtherIntent' }, session: { attributes: {} } }, new Reply(request));
    expect(promise)
    .to.eventually.be.rejectedWith(errors.UnsupportedIntent, 'Unsupported intent: OtherIntent for state entry');
  });

  it('should transition to die if result is not an object', () => {
    states.thirdState.enter = () => 'LaunchIntent.OpenResponse';

    const stateMachine = new StateMachine('thirdState', { states });
    return stateMachine.transition(request, new Reply(request))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should fail if there\'s no entry state', () => {
    expect(() => new StateMachine('initState', { states: {} })).to.throw('State machine must have a `entry` state.');
  });

  it('should return BadResponse on a falsey response from the state transition', () => {
    states.entry.enter = () => null;
    const stateMachine = new StateMachine('entry', { states });
    return expect(stateMachine.transition({ intent: { name: 'LaunchIntent' } }), new Reply(request)).to.eventually.be.rejectedWith(BadTransition);
  });
});
