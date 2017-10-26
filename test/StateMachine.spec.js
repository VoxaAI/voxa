'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const StateMachine = require('../lib/StateMachine.js');
const errors = require('../lib/Errors');
const Reply = require('../lib/VoxaReply');
const Promise = require('bluebird');
const simple = require('simple-mock');
const VoxaEvent = require('../lib/adapters/alexa/AlexaEvent');

describe('StateMachine', () => {
  let states;
  let voxaEvent;

  beforeEach(() => {
    voxaEvent = new VoxaEvent({
      request: {
        intent: {

        },
        locale: 'en-us',
      },
      session: {
        attributes: {

        },
      },
    });
    states = {
      entry: { enter: { entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }) }, name: 'entry' },
      initState: { enter: { entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }) }, name: 'initState' },
      secondState: { enter: { entry: () => ({ to: 'initState' }) }, name: 'secondState' },
      thirdState: { enter: { entry: () => Promise.resolve({ to: 'die' }) }, name: 'thirdState' },
    };
  });

  it('should transition to die', () => {
    const stateMachine = new StateMachine('initState', { states });
    return stateMachine.transition(voxaEvent, new Reply(voxaEvent))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should transition more than one state', () => {
    const stateMachine = new StateMachine('secondState', { states });
    return stateMachine.transition(voxaEvent, new Reply(voxaEvent))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should call onBeforeStateChangedCallbacks', () => {
    const onBeforeStateChanged = simple.stub();
    const stateMachine = new StateMachine('secondState', { onBeforeStateChanged: [onBeforeStateChanged], states });
    return stateMachine.transition(voxaEvent, new Reply(voxaEvent))
      .then(() => {
        expect(onBeforeStateChanged.called).to.be.true;
        expect(onBeforeStateChanged.callCount).to.equal(2);
      });
  });

  it('should transition on promises change', () => {
    const stateMachine = new StateMachine('thirdState', { states });
    return stateMachine.transition(voxaEvent, new Reply(voxaEvent))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should transition depending on intent if state.to ', () => {
    states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
    const stateMachine = new StateMachine('entry', { states });
    voxaEvent.intent.name = 'TestIntent';
    return stateMachine.transition(voxaEvent, new Reply(voxaEvent))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should transition to die if result is not an object', () => {
    states.thirdState.enter = { entry: () => 'LaunchIntent.OpenResponse' };

    const stateMachine = new StateMachine('thirdState', { states });
    return stateMachine.transition(voxaEvent, new Reply(voxaEvent))
      .then((response) => {
        expect(response.to.name).to.equal(states.die.name);
      });
  });

  it('should fail if there\'s no entry state', () => {
    expect(() => new StateMachine('initState', { states: {} })).to.throw('State machine must have a `entry` state.');
  });

  it('should fail if there\'s no states', () => {
    expect(() => new StateMachine('initState', { })).to.throw('State machine must have a `states` definition.');
  });

  describe('UnhandledState', () => {
    it('should throw UnhandledState on a falsey response from the state transition', () => {
      states.entry.enter = { entry: () => null };
      const stateMachine = new StateMachine('entry', { states });
      const promise = stateMachine.transition({ intent: { name: 'LaunchIntent' } }, new Reply(voxaEvent));
      return expect(promise).to.eventually.be.rejectedWith(errors.UnhandledState);
    });

    it('should throw an exception on invalid transition from pojo controller', () => {
      states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
      const stateMachine = new StateMachine('entry', { states });
      voxaEvent.intent.name = 'OtherIntent';
      const promise = stateMachine.transition(voxaEvent, new Reply(voxaEvent));
      return expect(promise).to.eventually.be.rejectedWith(errors.UnhandledState, 'OtherIntent went unhandled on entry state');
    });

    it('should execute the onUnhandledState callbacks on invalid transition from pojo controller', () => {
      states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
      const onUnhandledState = simple.spy(() => ({ to: 'die' }));
      const stateMachine = new StateMachine('entry', { states, onUnhandledState: [onUnhandledState] });
      voxaEvent.intent.name = 'OtherIntent';
      const promise = stateMachine.transition(voxaEvent, new Reply(voxaEvent));
      return expect(promise).to.eventually.deep.equal({
        to: {
          isTerminal: true,
          name: 'die',
        },
      });
    });
  });

  it('should throw UnknownState when transition.to goes to an undefined state from simple transition', () => {
    states.entry = { to: { LaunchIntent: 'undefinedState' }, name: 'entry' };
    const stateMachine = new StateMachine('entry', { states });
    voxaEvent.intent.name = 'LaunchIntent';
    return expect(stateMachine.transition(voxaEvent, new Reply(voxaEvent)))
      .to.eventually.be.rejectedWith(errors.UnknownState);
  });

  it('should throw UnknownState when transition.to goes to an undefined state', () => {
    states.someState = { enter: { entry: () => ({ to: 'undefinedState' }) }, name: 'someState' };
    const stateMachine = new StateMachine('someState', { states });

    return expect(stateMachine.transition(voxaEvent, new Reply(voxaEvent)))
      .to.eventually.be.rejectedWith(errors.UnknownState);
  });

  it('should fallback to entry on no response', () => {
    states.someState = {
      enter: { entry: simple.stub().returnWith(null) },
      name: 'someState',
    };

    const stateMachine = new StateMachine('someState', { states });
    voxaEvent.intent.name = 'LaunchIntent';
    return stateMachine.transition(voxaEvent, new Reply(voxaEvent))
      .then((transition) => {
        expect(states.someState.enter.entry.called).to.be.true;
        expect(transition).to.deep.equal({
          reply: 'ExitIntent.Farewell',
          to: {
            isTerminal: true,
            name: 'die',
          },
        });
      });
  });
});
