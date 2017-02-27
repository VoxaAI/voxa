'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const _ = require('lodash');
const simple = require('simple-mock');
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

      },

      session: {
        attributes: {
          state: 'secondState',
        },
      },
    };
    states = {
      entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      initState: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      secondState: () => ({ to: 'initState' }),
      thirdState: () => Promise.resolve({ to: 'die' }),
    };
  });

  it('should store the execution flow in the request', () => {
    const skill = new StateMachineSkill({ variables, views });
    let request;
    const spy = simple.spy((_request) => {
      request = _request;
    });
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });

    skill.onBeforeReplySent(spy);
    stateFlow(skill);

    return skill.execute(event)
      .then((result) => {
        expect(spy.called).to.be.true;
        expect(request.flow).to.deep.equal(['secondState', 'initState', 'die']);
      });
  });
});
