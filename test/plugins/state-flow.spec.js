'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const _ = require('lodash');
const StateMachineSkill = require('../../lib/StateMachineSkill');
const stateFlow = require('../../lib/plugins/state-flow');
const views = require('../views');
const variables = require('../variables');

describe('StateFlow plugin', () => {
  let states;
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
        attributes: {
          state: 'secondState',
        },
      },
    };
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
    const skill = new StateMachineSkill({ variables, views });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });

    stateFlow(skill);

    return skill.execute(event)
      .then((result) => {
        expect(result.alexaEvent.flow).to.deep.equal(['secondState', 'initState', 'die']);
      });
  });

  it('should not crash on null transition', () => {
    const skill = new StateMachineSkill({ variables, views });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });

    stateFlow(skill);
    event.session.attributes.state = 'fourthState';
    event.request.intent.name = 'OtherIntent';

    return skill.execute(event)
      .then((result) => {
        expect(result.alexaEvent.flow).to.deep.equal(['fourthState']);
      });
  });
});
