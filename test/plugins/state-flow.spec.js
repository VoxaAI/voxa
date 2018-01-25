'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const _ = require('lodash');
const StateMachineApp = require('../../src/VoxaApp').VoxaApp;
const AlexaEvent = require('../../src/platforms/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../../src/platforms/alexa/AlexaReply').AlexaReply;
const AlexaPlatform = require('../../src/platforms/alexa/AlexaPlatform').AlexaPlatform;
const stateFlow = require('../../src/plugins/state-flow').register;
const views = require('../views').views;
const variables = require('../variables').variables;

xdescribe('StateFlow plugin', () => {
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
            state: 'secondState',
          },
        },
      },
    });
    states = {
      entry: { SomeIntent: 'intent' },
      initState: () => ({ tell: 'ExitIntent.Farewell', to: 'die' }),
      secondState: () => ({ to: 'initState' }),
      thirdState: () => Promise.resolve({ to: 'die' }),
      fourthState: () => undefined,
      intent: () => ({ tell: 'ExitIntent.Farewell', to: 'die' }),
    };
  });

  it('should store the execution flow in the request', () => {
    const skill = new StateMachineApp({ variables, views });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
    stateFlow(skill);

    return skill.execute(event, new AlexaReply())
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
    event.session.attributes.model.state = 'fourthState';
    event.intent.name = 'OtherIntent';

    return skill.execute(event, new AlexaReply())
      .then((result) => {
        expect(result.voxaEvent.flow).to.deep.equal(['fourthState']);
      });
  });
});
