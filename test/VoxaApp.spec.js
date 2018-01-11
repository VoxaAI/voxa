'use strict';

const _ = require('lodash');
const simple = require('simple-mock');
const Promise = require('bluebird');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const StateMachineApp = require('../src/VoxaApp').VoxaApp;
const views = require('./views').views;
const variables = require('./variables');
const Model = require('../src/Model').Model;
const Reply = require('../src/VoxaReply').VoxaReply;
const AlexaEvent = require('../src/adapters/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../src/adapters/alexa/AlexaReply').AlexaReply;
const AlexaAdapter = require('../src/adapters/alexa/AlexaAdapter').AlexaAdapter;
const tools = require('./tools');

const PlayAudio = require('../src/adapters/alexa/directives').PlayAudio;

const rb = new tools.AlexaRequestBuilder();

describe('StateMachineApp', () => {
  let statesDefinition;
  let event;

  beforeEach(() => {
    event = new AlexaEvent(rb.getIntentRequest('SomeIntent'));
    simple.mock(AlexaAdapter, 'apiRequest')
      .resolveWith(true);

    statesDefinition = {
      entry: () => ({ reply: 'ExitIntent.Farewell', to: 'die' }),
      initState: { to: 'endState' },
      secondState: { to: 'initState' },
      thirdState: () => Promise.resolve({ to: 'endState' }),
      DisplayElementSelected: { reply: 'ExitIntent.Farewell', to: 'die' },
    };
  });

  describe('entry', () => {
    it('should do multiple transitions inside a single entry state', () => {
      const stateMachineApp = new StateMachineApp({ variables, views });
      event = new AlexaEvent(rb.getIntentRequest('LaunchIntent'));
      stateMachineApp.onState('entry', {
        LaunchIntent: 'One',
        One: 'Two',
        Two: 'Three',
        Three: 'Exit',
        Exit: { reply: 'ExitIntent.Farewell' },
      });

      return stateMachineApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(reply.error).to.be.undefined;
          expect(reply.response.statements).to.deep.equal(['Ok. For more info visit example.com site.']);
        });
    });
  });

  describe('onState', () => {
    it('should accept new states', () => {
      const stateMachineApp = new StateMachineApp({ variables, views });
      const fourthState = () => ({ to: 'endState' });
      stateMachineApp.onState('fourthState', fourthState);
      expect(stateMachineApp.states.fourthState.enter.entry).to.equal(fourthState);
    });

    it('should register simple states', () => {
      const stateMachineApp = new StateMachineApp({ variables, views });
      const stateFn = simple.stub();
      stateMachineApp.onState('init', stateFn);

      expect(stateMachineApp.states.init).to.deep.equal({
        name: 'init',
        enter: {
          entry: stateFn,
        },
      });
    });

    it('should register states for specific intents', () => {
      const stateMachineApp = new StateMachineApp({ variables, views });
      const stateFn = simple.stub();
      stateMachineApp.onState('init', stateFn, 'AMAZON.NoIntent');

      expect(stateMachineApp.states.init).to.deep.equal({
        name: 'init',
        enter: { 'AMAZON.NoIntent': stateFn },
      });
    });

    it('should register states for intent lists', () => {
      const stateMachineApp = new StateMachineApp({ variables, views });
      const stateFn = simple.stub();
      const stateFn2 = simple.stub();

      stateMachineApp.onState('init', stateFn, ['AMAZON.NoIntent', 'AMAZON.StopIntent']);
      stateMachineApp.onState('init', stateFn2, 'AMAZON.YesIntent');

      expect(stateMachineApp.states.init).to.deep.equal({
        name: 'init',
        enter: {
          'AMAZON.NoIntent': stateFn,
          'AMAZON.StopIntent': stateFn,
          'AMAZON.YesIntent': stateFn2,
        },
      });
    });
  });

  it('should include the state in the session response', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('LaunchIntent', () => {
      return { to: 'secondState', askP: 'This is my message' };
    });

    stateMachineApp.onState('secondState', () => {

    });

    event = new AlexaEvent(rb.getLaunchRequest());
    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(reply.session.attributes.model.state).to.equal('secondState');
        expect(reply.response.terminate).to.be.false;
      });
  });

  it('should add the message key from the transition to the reply', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('LaunchIntent', () => ({ tellP: 'This is my message'}));
    event.intent.name = 'LaunchIntent';

    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.statements[0]).to.deep.equal('This is my message');
      });
  });

  it('should throw an error if trying to render a missing view', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('LaunchIntent', () => ({ reply: 'Missing.View' }));
    event.intent.name = 'LaunchIntent';

    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error).to.be.an('error');
        expect(reply.error.message).to.equal('View Missing.View for en-US locale is missing');
      });
  });

  it('should allow multiple reply paths in reply key', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('LaunchIntent', (voxaEvent) => {
      voxaEvent.model.count = 0;
      return { reply: ['Count.Say', 'Count.Tell'] };
    });
    event.intent.name = 'LaunchIntent';

    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.statements).to.deep.equal(['0', '0']);
      });
  });

  it('should display element selected request', () => {
    const stateMachineSkill = new StateMachineApp({ variables, views });
    stateMachineSkill.onIntent('DisplayElementSelected', () => ({ reply: ['ExitIntent.Farewell'] }));
    event.request.type = 'Display.ElementSelected';

    return new AlexaAdapter(stateMachineSkill).execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.outputSpeech.ssml).to.equal('<speak>Ok. For more info visit example.com site.</speak>');
      });
  });

  it('should throw an error if multiple replies include anything after say or tell', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onIntent('LaunchIntent', (voxaEvent) => {
      voxaEvent.model.count = 0;
      return { reply: ['Count.Tell', 'Count.Say'] };
    });
    event.intent.name = 'LaunchIntent';

    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error.message).to.equal('Can\'t append to already yielding response');
      });
  });

  it('should be able to just pass through some intents to states', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    let called = false;
    stateMachineApp.onIntent('LoopOffIntent', () => {
      called = true;
      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    const alexa = new AlexaAdapter(stateMachineApp);

    const loopOffEvent = new AlexaEvent(rb.getIntentRequest('AMAZON.LoopOffIntent'));

    return alexa.execute(loopOffEvent, AlexaReply)
      .then(() => {
        expect(called).to.be.true;
      });
  });

  it('should accept onBeforeStateChanged callbacks', () => {
    const stateMachineApp = new StateMachineApp({ variables, views });
    stateMachineApp.onBeforeStateChanged(simple.stub());
  });

  it('should call the entry state on a new session', () => {
    statesDefinition.entry = simple.stub().resolveWith({
      reply: 'ExitIntent.Farewell',
    });

    const stateMachineApp = new StateMachineApp({ variables, views });
    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));

    return stateMachineApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  it('should throw an error if required properties missing from config', () => {
    expect(() => new StateMachineApp({ Model: { } })).to.throw(Error, 'Model should have a fromEvent method');
    expect(() => new StateMachineApp({ Model: { fromEvent: () => {} } })).to.throw(Error, 'Model should have a serialize method');
    expect(() => new StateMachineApp({ Model })).to.throw(Error, 'DefaultRenderer config should include views');
    expect(() => new StateMachineApp({ Model, views })).to.not.throw(Error);
  });

  it('should set properties on request and have those available in the state callbacks', () => {
    const stateMachineApp = new StateMachineApp({ views, variables });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(Model);

      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    return stateMachineApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
      });
  });

  it('should simply set an empty session if serialize is missing', () => {
    const stateMachineApp = new StateMachineApp({ views, variables });
    statesDefinition.entry = simple.spy((request) => {
      request.model = null;
      return { reply: 'Question.Ask', to: 'initState' };
    });
    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
        console.log(reply.session.attributes.model)
        expect(reply.session.attributes.model).to.deep.equal({ state: 'initState' });
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

    const stateMachineApp = new StateMachineApp({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { reply: 'Question.Ask', to: 'initState' };
    });

    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
        expect(reply.session.attributes.model).to.deep.equal({ value: 1 });
      });
  });

  it('should let  model.fromRequest to return a Promise', () => {
    class PromisyModel extends Model {
      static fromEvent() {
        return Promise.resolve(new PromisyModel());
      }
    }
    const stateMachineApp = new StateMachineApp({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    return stateMachineApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
      });
  });

  it('should call onSessionEnded callbacks if state is die', () => {
    const stateMachineApp = new StateMachineApp({ Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    const onSessionEnded = simple.stub();
    stateMachineApp.onSessionEnded(onSessionEnded);

    return stateMachineApp.execute(event, AlexaReply)
      .then(() => {
        expect(onSessionEnded.called).to.be.true;
      });
  });

  it('should call onBeforeReplySent callbacks', () => {
    const stateMachineApp = new StateMachineApp({ Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    const onBeforeReplySent = simple.stub();
    stateMachineApp.onBeforeReplySent(onBeforeReplySent);

    return stateMachineApp.execute(event, AlexaReply)
      .then(() => {
        expect(onBeforeReplySent.called).to.be.true;
      });
  });

  it('should call entry on a LaunchRequest', () => {
    const stateMachineApp = new StateMachineApp({ Model, views, variables });

    event.intent.name = 'LaunchIntent';
    statesDefinition.entry = simple.stub().resolveWith({
      to: 'die',
    });

    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    return stateMachineApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  describe('onUnhandledState', () => {
    it('should give a proper error message when an intent is unhandled', () => {
      const stateMachineApp = new StateMachineApp({ Model, views, variables });
      event.intent.name = 'LaunchIntent';
      stateMachineApp.onState('entry', { });

      return stateMachineApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(reply.error.message).to.equal('LaunchIntent went unhandled on entry state');
        });
    });

    it('should call onUnhandledState callbacks when the state machine transition throws a UnhandledState error', () => {
      const stateMachineApp = new StateMachineApp({ Model, views, variables });
      const onUnhandledState = simple.stub().resolveWith({
        reply: 'ExitIntent.Farewell',
      });

      stateMachineApp.onUnhandledState(onUnhandledState);

      event.intent.name = 'LaunchIntent';
      statesDefinition.entry = simple.stub().resolveWith(null);

      _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
      return stateMachineApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(onUnhandledState.called).to.be.true;
          expect(reply.response.statements[0]).to.equal('Ok. For more info visit example.com site.');
        });
    });
  });

  it('should include all directives in the reply', () => {
    const stateMachineApp = new StateMachineApp({ Model, variables, views });

    const directives = [PlayAudio('url', '123', 0, 'REPLACE_ALL')]

    stateMachineApp.onIntent('SomeIntent', () => ({
      reply: 'ExitIntent.Farewell',
      to: 'entry',
      directives,
    }));

    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.directives).to.not.be.undefined;
        expect(reply.response.directives).to.have.length(1);
        expect(reply.response.directives[0]).to.deep.equal({
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
    const stateMachineApp = new StateMachineApp({ Model, variables, views });

    const directives = [PlayAudio('url', '123', 0, 'REPLACE_ALL')]

    stateMachineApp.onIntent('SomeIntent', () => ({
      reply: 'ExitIntent.Farewell',
      directives,
    }));

    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.directives).to.not.be.undefined;
        expect(reply.response.directives).to.have.length(1);
        expect(reply.response.directives[0]).to.deep.equal({
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
    const stateMachineApp = new StateMachineApp({ Model, views, variables });

    event.intent.name = 'LaunchIntent';
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

    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.statements).to.deep.equal(['0', '1']);
      });
  });

  it('should call onIntentRequest callbacks before the statemachine', () => {
    const stateMachineApp = new StateMachineApp({ Model, views, variables });
    _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
    const stubResponse = 'STUB RESPONSE';
    const stub = simple.stub().resolveWith(stubResponse);
    stateMachineApp.onIntentRequest(stub);

    return stateMachineApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(stub.called).to.be.true;
        expect(reply).to.not.equal(stubResponse);
        expect(reply.response.statements[0]).to.equal('Ok. For more info visit example.com site.');
      });
  });

  describe('onAfterStateChanged', () => {
    it('should return the onError response for exceptions thrown in onAfterStateChanged', () => {
      const stateMachineApp = new StateMachineApp({ Model, views, variables });
      _.map(statesDefinition, (state, name) => stateMachineApp.onState(name, state));
      const spy = simple.spy(() => {
        throw new Error('FAIL!');
      });

      stateMachineApp.onAfterStateChanged(spy);

      return stateMachineApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(spy.called).to.be.true;
          expect(reply.error).to.be.an('error');
        });
    });
  });

  describe('onRequestStarted', () => {
    it('should return the onError response for exceptions thrown in onRequestStarted', () => {
      const stateMachineApp = new StateMachineApp({ Model, views, variables });
      const spy = simple.spy(() => {
        throw new Error('FAIL!');
      });

      stateMachineApp.onRequestStarted(spy);

      return stateMachineApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(spy.called).to.be.true;
          expect(reply.error).to.be.an('error');
        });
    });
  });
});
