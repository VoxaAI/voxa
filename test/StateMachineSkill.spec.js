'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const simple = require('simple-mock');
const StateMachineSkill = require('../lib/StateMachineSkill.js');
const Promise = require('bluebird');
const _ = require('lodash');
const views = require('./views');
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
      entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      initState: () => ({ to: 'endState' }),
      secondState: () => ({ to: 'initState' }),
      thirdState: () => Promise.resolve({ to: 'endState' }),
    };
  });

  it('should redirect be able to just pass through some intents to states', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, views });
    let called = false;
    stateMachineSkill.onIntent('AMAZON.LoopOffIntent', () => {
      called = true;
      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    event.request.intent.name = 'AMAZON.LoopOffIntent';
    return stateMachineSkill.execute(event)
      .then(() => {
        expect(called).to.be.true;
      });
  });

  it('should accept new states', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, views });
    const fourthState = () => ({ to: 'endState' });
    stateMachineSkill.onState('fourthState', fourthState);
    expect(stateMachineSkill.states.fourthState.enter).to.equal(fourthState);
  });

  it('should accept onBeforeStateChanged callbacks', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, views });
    stateMachineSkill.onBeforeStateChanged(simple.stub());
  });

  it('should call the entry state on a new session', () => {
    statesDefinition.entry = simple.stub().resolveWith({
      reply: 'ExitIntent.Farewell',
    });

    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, views });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));

    return stateMachineSkill.execute(event)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  it('should throw an error if required properties missing from config', () => {
    expect(() => new StateMachineSkill('appId', { })).to.throw(Error, 'Config should include a model');
    expect(() => new StateMachineSkill('appId', { Model: { } })).to.throw(Error, 'Model should have a fromRequest method');
    expect(() => new StateMachineSkill('appId', { Model: { fromRequest: () => {} } })).to.throw(Error, 'Model should have a serialize method');
    expect(() => new StateMachineSkill('appId', { Model: { fromRequest: () => {}, serialize: () => {} } })).to.throw(Error, 'Config should include variables');
    expect(() => new StateMachineSkill('appId', { Model, variables })).to.throw(Error, 'Config should include views');
    expect(() => new StateMachineSkill('appId', { Model, variables, views })).to.not.throw(Error);
  });

  it('should set properties on request and have those available in the state callbacks', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, views, variables });
    statesDefinition.entry = (request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(Model);

      return { reply: 'ExitIntent.Farewell', to: 'die' };
    };

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event);
  });

  it('should call onSessionEnded callbacks if state is die', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    const onSessionEnded = simple.stub();
    stateMachineSkill.onSessionEnded(onSessionEnded);

    return stateMachineSkill.execute(event)
      .then(() => {
        expect(onSessionEnded.called).to.be.true;
      });
  });

  it('should call onBeforeReplySent callbacks', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    const onBeforeReplySent = simple.stub();
    stateMachineSkill.onBeforeReplySent(onBeforeReplySent);

    return stateMachineSkill.execute(event)
      .then(() => {
        expect(onBeforeReplySent.called).to.be.true;
      });
  });

  it('should call entry on a LaunchRequest', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, views, variables });

    event.request.type = 'LaunchRequest';
    statesDefinition.entry = simple.stub().resolveWith({
      to: 'die',
    });

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  it('should call onBadResponse callbacks when the state machine transition throws a BadResponse error', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, views, variables });
    const onBadResponse = simple.stub();
    stateMachineSkill.onBadResponse(onBadResponse);

    event.request.type = 'LaunchRequest';
    statesDefinition.entry = simple.stub().resolveWith(null);

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event)
      .then(() => {
        expect(onBadResponse.called).to.be.true;
      });
  });

  it('should add a reply to session if reply is an ask', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, views, variables });
    stateMachineSkill.onIntent('AskIntent', () => ({ to: 'exit', reply: 'Question.Ask' }));
    stateMachineSkill.onState('exit', () => 'ExitIntent.Farewell');
    event.request.intent.name = 'AskIntent';
    return stateMachineSkill.execute((event))
      .then((result) => {
        expect(result.sessionAttributes.reply).to.deep.equal({
          msgPath: 'Question.Ask',
          state: 'exit',
        });
      });
  });

  it('should include all directives in the reply', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, views });

    const directives = {
      type: 'AudioPlayer.Play',
      playBehavior: 'REPLACE_ALL',
      offsetInMilliseconds: 0,
      url: 'url',
      token: '123',
    };

    stateMachineSkill.onIntent('SomeIntent', () => ({
      reply: 'ExitIntent.Farewell',
      to: 'entry',
      directives,
    }));

    return stateMachineSkill.execute(event)
      .then((result) => {
        expect(result.response.directives).to.not.be.undefined;
        expect(result.response.directives[0]).to.deep.equal({
          type: 'AudioPlayer.Play',
          playBehavior: 'REPLACE_ALL',
          audioItem: {
            stream: {
              offsetInMilliseconds: 0,
              token: '123',
              url: 'url',
            },
          },
        });
      });
  });

  it('should include all directives in the reply even if die', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, variables, views });

    const directives = {
      type: 'AudioPlayer.Play',
      playBehavior: 'REPLACE_ALL',
      offsetInMilliseconds: 0,
      url: 'url',
      token: '123',
    };

    stateMachineSkill.onIntent('SomeIntent', () => ({
      reply: 'ExitIntent.Farewell',
      directives,
    }));

    return stateMachineSkill.execute(event)
      .then((result) => {
        expect(result.response.directives).to.not.be.undefined;
        expect(result.response.directives[0]).to.deep.equal({
          type: 'AudioPlayer.Play',
          playBehavior: 'REPLACE_ALL',
          audioItem: {
            stream: {
              offsetInMilliseconds: 0,
              token: '123',
              url: 'url',
            },
          },
        });
      });
  });

  it('should render all messages after each transition', () => {
    const stateMachineSkill = new StateMachineSkill('appId', { Model, views, variables });

    event.request.type = 'LaunchRequest';
    statesDefinition.entry = {
      to: {
        LaunchIntent: 'fourthState',
      },
    };

    statesDefinition.fourthState = (request) => {
      request.model.count = 0;
      return { reply: 'Count.Say', to: 'fifthState' };
    };

    statesDefinition.fifthState = (request) => {
      request.model.count = 1;
      return { reply: 'Count.Tell', to: 'die' };
    };

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.response.outputSpeech.ssml).to.equal('<speak>0\n1</speak>');
      });
  });
});

