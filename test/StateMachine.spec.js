'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const Promise = require('bluebird');
const simple = require('simple-mock');

chai.use(chaiAsPromised);

const expect = chai.expect;
const StateMachine = require('../src/StateMachine').StateMachine;
const errors = require('../src/errors');
const Reply = require('../src/VoxaReply').VoxaReply;
const AlexaEvent = require('../src/platforms/alexa/AlexaEvent').AlexaEvent;
const tools = require('./tools');

const rb = new tools.AlexaRequestBuilder()

describe('StateMachine', () => {
  let states;
  let voxaEvent;

  beforeEach(() => {
    voxaEvent = new AlexaEvent(rb.getIntentRequest('AMAZON.YesIntent'));
    states = {
      entry: { enter: { entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }) }, name: 'entry' },
      initState: { enter: { entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }) }, name: 'initState' },
      secondState: { enter: { entry: () => ({ to: 'initState' }) }, name: 'secondState' },
      thirdState: { enter: { entry: () => Promise.resolve({ to: 'die' }) }, name: 'thirdState' },
    };
  });


  it('should fail if there\'s no entry state', () => {
    expect(() => new StateMachine('initState', { states: {} })).to.throw('State machine must have a `entry` state.');
  });

  it('should fail if there\'s no states', () => {
    expect(() => new StateMachine('initState', { })).to.throw('State machine must have a `states` definition.');
  });




  describe('runTransition', () => {
    it('should transition to die', () => {
      const stateMachine = new StateMachine('initState', { states });
      return stateMachine.runTransition(voxaEvent, new Reply(voxaEvent))
        .then((response) => {
          expect(response.to.name).to.equal(states.die.name);
        });
    });

    it('should transition more than one state', () => {
      const stateMachine = new StateMachine('secondState', { states });
      return stateMachine.runTransition(voxaEvent, new Reply(voxaEvent))
        .then((response) => {
          expect(response.to.name).to.equal(states.die.name);
        });
    });

    it('should call onBeforeStateChangedCallbacks', () => {
      const onBeforeStateChanged = simple.stub();
      const stateMachine = new StateMachine('secondState', { onBeforeStateChanged: [onBeforeStateChanged], states });
      return stateMachine.runTransition(voxaEvent, new Reply(voxaEvent))
        .then(() => {
          expect(onBeforeStateChanged.called).to.be.true;
          expect(onBeforeStateChanged.callCount).to.equal(2);
        });
    });

    it('should transition on promises change', () => {
      const stateMachine = new StateMachine('thirdState', { states });
      return stateMachine.runTransition(voxaEvent, new Reply(voxaEvent))
        .then((response) => {
          expect(response.to.name).to.equal(states.die.name);
        });
    });

    it('should transition depending on intent if state.to ', () => {
      states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
      const stateMachine = new StateMachine('entry', { states });
      voxaEvent.intent.name = 'TestIntent';
      return stateMachine.runTransition(voxaEvent, new Reply(voxaEvent))
        .then((response) => {
          expect(response.to.name).to.equal(states.die.name);
        });
    });

    it('should transition to die if result is not an object', () => {
      states.thirdState.enter = { entry: () => 'LaunchIntent.OpenResponse' };

      const stateMachine = new StateMachine('thirdState', { states });
      return stateMachine.runTransition(voxaEvent, new Reply(voxaEvent))
        .then((response) => {
          expect(response.to.name).to.equal(states.die.name);
        });
    });

    it('should throw an error if there\'s no transition and no intent', () => {
      voxaEvent.intent = undefined;
      const stateMachine = new StateMachine('thirdState', { states });
      return expect(stateMachine.runTransition(voxaEvent)).to.eventually.be.rejectedWith(Error, 'Running the state machine without an intent');
    });


    describe('UnhandledState', () => {
      it('should throw UnhandledState on a falsey response from the state transition', () => {
        states.entry.enter = { entry: () => null };
        const stateMachine = new StateMachine('entry', { states });
        const promise = stateMachine.runTransition({ intent: { name: 'LaunchIntent' } }, new Reply(voxaEvent));
        return expect(promise).to.eventually.be.rejectedWith(Error, 'LaunchIntent went unhandled on entry state');
      });

      it('should throw an exception on invalid transition from pojo controller', () => {
        states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
        const stateMachine = new StateMachine('entry', { states });
        voxaEvent.intent.name = 'OtherIntent';
        const promise = stateMachine.runTransition(voxaEvent, new Reply(voxaEvent));
        return expect(promise).to.eventually.be.rejectedWith(Error, 'OtherIntent went unhandled on entry state');
      });

      it('should execute the onUnhandledState callbacks on invalid transition from pojo controller', () => {
        states.entry = { to: { TestIntent: 'die' }, name: 'entry' };
        const onUnhandledState = simple.spy(() => ({ to: 'die' }));
        const stateMachine = new StateMachine('entry', { states, onUnhandledState: [onUnhandledState] });
        voxaEvent.intent.name = 'OtherIntent';
        const promise = stateMachine.runTransition(voxaEvent, new Reply(voxaEvent));
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
      return expect(stateMachine.runTransition(voxaEvent, new Reply(voxaEvent)))
        .to.eventually.be.rejectedWith(Error, 'Unknown state undefinedState');
    });

    it('should throw UnknownState when transition.to goes to an undefined state', () => {
      states.someState = { enter: { entry: () => ({ to: 'undefinedState' }) }, name: 'someState' };
      const stateMachine = new StateMachine('someState', { states });

      return expect(stateMachine.runTransition(voxaEvent, new Reply(voxaEvent)))
        .to.eventually.be.rejectedWith(Error, 'Unknown state undefinedState');
    });

    it('should fallback to entry on no response', () => {
      states.someState = {
        enter: { entry: simple.stub().returnWith(null) },
        name: 'someState',
      };

      const stateMachine = new StateMachine('someState', { states });
      voxaEvent.intent.name = 'LaunchIntent';
      return stateMachine.runTransition(voxaEvent, new Reply(voxaEvent))
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

  describe('runCurrentState', () => {
    it('should throw an error if run without an intent', () => {
      voxaEvent.intent = undefined;
      const stateMachine = new StateMachine('someState', { states });
      return expect(stateMachine.runCurrentState(voxaEvent)).to.eventually.be.rejectedWith(Error, 'Running the state machine without an intent')
    });


    it('should run the specific intent enter function', () => {
      const stateMachine = new StateMachine('someState', { states });
      const stub1 = simple.stub();
      const stub2 = simple.stub();
      stateMachine.currentState = {
        enter: {
          'YesIntent': stub1,
          entry: stub2
        }
      }

      return stateMachine.runCurrentState(voxaEvent).then((result) => {
        expect(stub1.called).to.be.true;
        expect(stub2.called).to.be.false;
      })
    });
  });
});
