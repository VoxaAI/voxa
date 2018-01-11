'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const _ = require('lodash');
const StateMachineApp = require('../../src/VoxaApp').VoxaApp;
const AlexaEvent = require('../../src/adapters/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../../src/adapters/alexa/AlexaReply').AlexaReply;
const stateFlow = require('../../src/plugins/state-flow');
const views = require('../views').views;
const variables = require('../variables');

describe('StateFlow plugin', () => {
  let states;
  let event;

  beforeEach(() => {
    event = new AlexaEvent({
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'SomeIntent',
        },
        locale: 'en-us',
      },

      session: {
        new: false,
        attributes: {
          model: {
            _state: 'secondState',
          },
        },
      },
    });
    states = {
      entry: { SomeIntent: 'intent' },
      initState: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      secondState: () => ({ to: 'initState' }),
      thirdState: () => Promise.resolve({ to: 'die' }),
      fourthState: () => undefined,
      intent: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
    };
  });

  it('should store the execution flow in the request', () => {
    const skill = new StateMachineApp({ variables, views });
    stateFlow(skill);
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });


    return skill.execute(event, AlexaReply)
      .then((result) => {
        expect(result.voxaEvent.flow).to.deep.equal(['secondState', 'initState', 'die']);
      });
  });

  it('should not crash on null transition', () => {
    const skill = new StateMachineApp({ variables, views });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });

    stateFlow(skill);
    event.session.attributes.model._state = 'fourthState';
    event.intent.name = 'OtherIntent';

    return skill.execute(event, AlexaReply)
      .then((result) => {
        expect(result.voxaEvent.flow).to.deep.equal(['fourthState']);
      });
  });
});
