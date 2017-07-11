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
const Model = require('../lib/Model');
const Reply = require('../lib/Reply');
const AlexaEvent = require('../lib/AlexaEvent');

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

  it('should add the message key from the transition to the reply', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('LaunchIntent', () => ({ message: { tell: 'This is my message' } }));
    event.request.type = 'LaunchRequest';

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.deep.equal('This is my message');
      });
  });

  it('should throw an error if trying to render a missing view', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('LaunchIntent', () => ({ reply: 'Missing.View' }));
    event.request.type = 'LaunchRequest';

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.error).to.be.an('error');
        expect(reply.error.message).to.equal('Missing view Missing.View');
      });
  });

  it('should add use append the reply key to the Reply if it\'s a Reply object', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    const reply = new Reply(new AlexaEvent({}), { tell: 'This is my message' });
    stateMachineSkill.onIntent('LaunchIntent', () => ({ reply }));
    event.request.type = 'LaunchRequest';

    return stateMachineSkill.execute(event)
      .then((skillReply) => {
        expect(skillReply.msg.statements[0]).to.deep.equal('This is my message');
      });
  });

  it('should allow multiple reply paths in reply key', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('LaunchIntent', (alexaEvent) => {
      alexaEvent.model.count = 0;
      return { reply: ['Count.Say', 'Count.Tell'] };
    });
    event.request.type = 'LaunchRequest';

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements).to.deep.equal(['0', '0']);
      });
  });

  it('should throw an error if multiple replies include anything after say or tell', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('LaunchIntent', (alexaEvent) => {
      alexaEvent.model.count = 0;
      return { reply: ['Count.Tell', 'Count.Say'] };
    });
    event.request.type = 'LaunchRequest';

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.error.message).to.equal('Can\'t append to already yielding response');
      });
  });

  it('should redirect be able to just pass through some intents to states', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
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
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    const fourthState = () => ({ to: 'endState' });
    stateMachineSkill.onState('fourthState', fourthState);
    expect(stateMachineSkill.states.fourthState.enter).to.equal(fourthState);
  });

  it('should accept onBeforeStateChanged callbacks', () => {
    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onBeforeStateChanged(simple.stub());
  });

  it('should call the entry state on a new session', () => {
    statesDefinition.entry = simple.stub().resolveWith({
      reply: 'ExitIntent.Farewell',
    });

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));

    return stateMachineSkill.execute(event)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  it('should throw an error if required properties missing from config', () => {
    expect(() => new StateMachineSkill({ Model: { } })).to.throw(Error, 'Model should have a fromEvent method');
    expect(() => new StateMachineSkill({ Model: { fromEvent: () => {} } })).to.throw(Error, 'Model should have a serialize method');
    expect(() => new StateMachineSkill({ Model })).to.throw(Error, 'DefaultRenderer config should include views');
    expect(() => new StateMachineSkill({ Model, views })).to.not.throw(Error);
  });

  it('should set properties on request and have those available in the state callbacks', () => {
    const stateMachineSkill = new StateMachineSkill({ views, variables });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(Model);

      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
      });
  });

  it('should simply set an empty session if serialize is missing', () => {
    const stateMachineSkill = new StateMachineSkill({ views, variables });
    statesDefinition.entry = simple.spy((request) => {
      request.model = null;
      return { reply: 'Question.Ask', to: 'initState' };
    });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
        expect(reply.session.attributes.modelData).to.be.null;
        expect(reply.session.attributes.state).to.equal('initState');
      });
  });

  it('should allow async serialization in Model', () => {
    class PromisyModel extends Model {
      serialize() { // eslint-disable-line class-methods-use-this
        return Promise.resolve({
          value: 1,
        });
      }
    }

    const stateMachineSkill = new StateMachineSkill({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { reply: 'Question.Ask', to: 'initState' };
    });

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
        expect(reply.session.attributes.modelData).to.deep.equal({ value: 1 });
      });
  });

  it('should let  model.fromRequest to return a Promise', () => {
    class PromisyModel extends Model {
      static fromEvent() {
        return Promise.resolve(new PromisyModel());
      }
    }
    const stateMachineSkill = new StateMachineSkill({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    return stateMachineSkill.execute(event)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
      });
  });

  it('should call onSessionEnded callbacks if state is die', () => {
    const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    const onSessionEnded = simple.stub();
    stateMachineSkill.onSessionEnded(onSessionEnded);

    return stateMachineSkill.execute(event)
      .then(() => {
        expect(onSessionEnded.called).to.be.true;
      });
  });

  it('should call onBeforeReplySent callbacks', () => {
    const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    const onBeforeReplySent = simple.stub();
    stateMachineSkill.onBeforeReplySent(onBeforeReplySent);

    return stateMachineSkill.execute(event)
      .then(() => {
        expect(onBeforeReplySent.called).to.be.true;
      });
  });

  it('should call entry on a LaunchRequest', () => {
    const stateMachineSkill = new StateMachineSkill({ Model, views, variables });

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

  describe('onUnhandledState', () => {
    it('should give a proper error message when an intent is unhandled', () => {
      const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
      event.request.type = 'LaunchRequest';
      stateMachineSkill.onState('entry', { });

      return stateMachineSkill.execute(event)
        .then((reply) => {
          expect(reply.error.message).to.equal('LaunchIntent went unhandled on entry state');
        });
    });

    it('should call onUnhandledState callbacks when the state machine transition throws a UnhandledState error', () => {
      const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
      const onUnhandledState = simple.stub().resolveWith({
        reply: 'ExitIntent.Farewell',
      });

      stateMachineSkill.onUnhandledState(onUnhandledState);

      event.request.type = 'LaunchRequest';
      statesDefinition.entry = simple.stub().resolveWith(null);

      _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
      return stateMachineSkill.execute(event)
        .then((reply) => {
          expect(onUnhandledState.called).to.be.true;
          expect(reply.msg.statements[0]).to.equal('Ok. For more info visit example.com site.');
        });
    });
  });

  describe('onStateMachineError', () => {
    it('should call onStateMachineError handlers for exceptions thrown inside a state', () => {
      const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
      const spy = simple.spy(request => new Reply(request, { tell: 'My custom response' }));
      stateMachineSkill.onStateMachineError(spy);
      stateMachineSkill.onIntent('AskIntent', () => abc); // eslint-disable-line no-undef

      event.request.intent.name = 'AskIntent';
      return stateMachineSkill.execute((event))
        .then((reply) => {
          expect(spy.called).to.be.true;
          expect(reply.error).to.be.an('error');
          expect(reply.msg.statements[0]).to.equal('My custom response');
        });
    });
  });

  it('should include all directives in the reply', () => {
    const stateMachineSkill = new StateMachineSkill({ Model, variables, views });

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
      .then((reply) => {
        expect(reply.msg.directives).to.not.be.undefined;
        expect(reply.msg.directives).to.have.length(1);
        expect(reply.msg.directives[0]).to.deep.equal({
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
    const stateMachineSkill = new StateMachineSkill({ Model, variables, views });

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
      .then((reply) => {
        expect(reply.msg.directives).to.not.be.undefined;
        expect(reply.msg.directives).to.have.length(1);
        expect(reply.msg.directives[0]).to.deep.equal({
          playBehavior: 'REPLACE_ALL',
          type: 'AudioPlayer.Play',
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
    const stateMachineSkill = new StateMachineSkill({ Model, views, variables });

    event.request.type = 'LaunchRequest';
    statesDefinition.entry = {
      LaunchIntent: 'fourthState',
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
        expect(reply.msg.statements).to.deep.equal(['0', '1']);
      });
  });

  it('should call onIntentRequest callbacks before the statemachine', () => {
    const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
    const stubResponse = 'STUB RESPONSE';
    const stub = simple.stub().resolveWith(stubResponse);
    stateMachineSkill.onIntentRequest(stub);

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(stub.called).to.be.true;
        expect(reply).to.not.equal(stubResponse);
        expect(reply.msg.statements[0]).to.equal('Ok. For more info visit example.com site.');
      });
  });

  describe('onAfterStateChanged', () => {
    it('should return the onError response for exceptions thrown in onAfterStateChanged', () => {
      const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
      _.map(statesDefinition, (state, name) => stateMachineSkill.onState(name, state));
      const spy = simple.spy(() => {
        throw new Error('FAIL!');
      });

      stateMachineSkill.onAfterStateChanged(spy);

      return stateMachineSkill.execute(event)
        .then((reply) => {
          expect(spy.called).to.be.true;
          expect(reply.error).to.be.an('error');
        });
    });
  });

  describe('lambda', () => {
    it('should call execute with the correct context and callback', (done) => {
      const skill = new StateMachineSkill({ Model, views, variables });
      _.map(statesDefinition, (state, name) => skill.onState(name, state));
      skill.lambda()(event, { context: 'context' }, (err, result) => {
        if (err) done(err);
        expect(result.msg.statements).to.deep.equal(['Ok. For more info visit example.com site.']);
        done();
      });
    });
  });

  describe('onRequestStarted', () => {
    it('should return the onError response for exceptions thrown in onRequestStarted', () => {
      const stateMachineSkill = new StateMachineSkill({ Model, views, variables });
      const spy = simple.spy(() => {
        throw new Error('FAIL!');
      });

      stateMachineSkill.onRequestStarted(spy);

      return stateMachineSkill.execute(event)
        .then((reply) => {
          expect(spy.called).to.be.true;
          expect(reply.error).to.be.an('error');
        });
    });
  });
});
