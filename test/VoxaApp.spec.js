'use strict';

const _ = require('lodash');
const simple = require('simple-mock');
const Promise = require('bluebird');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const VoxaApp = require('../src/VoxaApp').VoxaApp;
const views = require('./views').views;
const variables = require('./variables').variables;
const Model = require('../src/Model').Model;
const Reply = require('../src/VoxaReply').VoxaReply;
const AlexaEvent = require('../src/platforms/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../src/platforms/alexa/AlexaReply').AlexaReply;
const AlexaAdapter = require('../src/platforms/alexa/AlexaAdapter').AlexaAdapter;
const tools = require('./tools');

const playAudio = require('../src/platforms/alexa/directives').playAudio;

const rb = new tools.AlexaRequestBuilder();

describe('VoxaApp', () => {
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
      const voxaApp = new VoxaApp({ variables, views });
      event = new AlexaEvent(rb.getIntentRequest('LaunchIntent'));
      voxaApp.onState('entry', {
        LaunchIntent: 'One',
        One: 'Two',
        Two: 'Three',
        Three: 'Exit',
        Exit: { reply: 'ExitIntent.Farewell' },
      });

      return voxaApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(reply.error).to.be.undefined;
          expect(reply.response.statements).to.deep.equal(['Ok. For more info visit example.com site.']);
        });
    });
  });

  describe('onState', () => {
    it('should accept new states', () => {
      const voxaApp = new VoxaApp({ variables, views });
      const fourthState = () => ({ to: 'endState' });
      voxaApp.onState('fourthState', fourthState);
      expect(voxaApp.states.fourthState.enter.entry).to.equal(fourthState);
    });

    it('should register simple states', () => {
      const voxaApp = new VoxaApp({ variables, views });
      const stateFn = simple.stub();
      voxaApp.onState('init', stateFn);

      expect(voxaApp.states.init).to.deep.equal({
        name: 'init',
        enter: {
          entry: stateFn,
        },
      });
    });

    it('should register states for specific intents', () => {
      const voxaApp = new VoxaApp({ variables, views });
      const stateFn = simple.stub();
      voxaApp.onState('init', stateFn, 'AMAZON.NoIntent');

      expect(voxaApp.states.init).to.deep.equal({
        name: 'init',
        enter: { 'AMAZON.NoIntent': stateFn },
      });
    });

    it('should register states for intent lists', () => {
      const voxaApp = new VoxaApp({ variables, views });
      const stateFn = simple.stub();
      const stateFn2 = simple.stub();

      voxaApp.onState('init', stateFn, ['AMAZON.NoIntent', 'AMAZON.StopIntent']);
      voxaApp.onState('init', stateFn2, 'AMAZON.YesIntent');

      expect(voxaApp.states.init).to.deep.equal({
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
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent('LaunchIntent', () => {
      return { to: 'secondState', askP: 'This is my message' };
    });

    voxaApp.onState('secondState', () => {

    });

    event = new AlexaEvent(rb.getLaunchRequest());
    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(reply.session.attributes.model.state).to.equal('secondState');
        expect(reply.response.terminate).to.be.false;
      });
  });

  it('should add the message key from the transition to the reply', () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent('LaunchIntent', () => ({ tellP: 'This is my message'}));
    event.intent.name = 'LaunchIntent';

    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.statements[0]).to.deep.equal('This is my message');
      });
  });

  it('should throw an error if trying to render a missing view', () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent('LaunchIntent', () => ({ reply: 'Missing.View' }));
    event.intent.name = 'LaunchIntent';

    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error).to.be.an('error');
        expect(reply.error.message).to.equal('View Missing.View for en-US locale is missing');
      });
  });

  it('should allow multiple reply paths in reply key', () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent('LaunchIntent', (voxaEvent) => {
      voxaEvent.model.count = 0;
      return { reply: ['Count.Say', 'Count.Tell'] };
    });
    event.intent.name = 'LaunchIntent';

    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.statements).to.deep.equal(['0', '0']);
      });
  });

  it('should display element selected request', () => {
    const stateMachineSkill = new VoxaApp({ variables, views });
    stateMachineSkill.onIntent('Display.ElementSelected', { to: 'die', reply: 'ExitIntent.Farewell' });
    event.intent = undefined;
    event.request.type = 'Display.ElementSelected';

    return new AlexaAdapter(stateMachineSkill).execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.outputSpeech.ssml).to.equal('<speak>Ok. For more info visit example.com site.</speak>');
      });
  });

  it('should throw an error if multiple replies include anything after say or tell', () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent('LaunchIntent', (voxaEvent) => {
      voxaEvent.model.count = 0;
      return { reply: ['Count.Tell', 'Count.Say'] };
    });
    event.intent.name = 'LaunchIntent';

    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error.message).to.equal('Can\'t append to already yielding response');
      });
  });

  it('should be able to just pass through some intents to states', () => {
    const voxaApp = new VoxaApp({ variables, views });
    let called = false;
    voxaApp.onIntent('LoopOffIntent', () => {
      called = true;
      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    const alexa = new AlexaAdapter(voxaApp);

    const loopOffEvent = new AlexaEvent(rb.getIntentRequest('AMAZON.LoopOffIntent'));

    return alexa.execute(loopOffEvent, AlexaReply)
      .then(() => {
        expect(called).to.be.true;
      });
  });

  it('should accept onBeforeStateChanged callbacks', () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onBeforeStateChanged(simple.stub());
  });

  it('should call the entry state on a new session', () => {
    statesDefinition.entry = simple.stub().resolveWith({
      reply: 'ExitIntent.Farewell',
    });

    const voxaApp = new VoxaApp({ variables, views });
    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));

    return voxaApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  it('should throw an error if required properties missing from config', () => {
    expect(() => new VoxaApp({ Model: { } })).to.throw(Error, 'Model should have a fromEvent method');
    expect(() => new VoxaApp({ Model: { fromEvent: () => {} } })).to.throw(Error, 'Model should have a serialize method');
    expect(() => new VoxaApp({ Model })).to.throw(Error, 'DefaultRenderer config should include views');
    expect(() => new VoxaApp({ Model, views })).to.not.throw(Error);
  });

  it('should set properties on request and have those available in the state callbacks', () => {
    const voxaApp = new VoxaApp({ views, variables });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(Model);

      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    return voxaApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
      });
  });

  it('should simply set an empty session if serialize is missing', () => {
    const voxaApp = new VoxaApp({ views, variables });
    statesDefinition.entry = simple.spy((request) => {
      request.model = null;
      return { reply: 'Question.Ask', to: 'initState' };
    });
    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.error).to.be.undefined;
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
        expect(reply.session.attributes.model).to.deep.equal(new Model({ state: 'initState' }));
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

    const voxaApp = new VoxaApp({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { reply: 'Question.Ask', to: 'initState' };
    });

    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    return voxaApp.execute(event, AlexaReply)
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
    const voxaApp = new VoxaApp({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { reply: 'ExitIntent.Farewell', to: 'die' };
    });

    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    return voxaApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
        expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
      });
  });

  it('should call onSessionEnded callbacks if state is die', () => {
    const voxaApp = new VoxaApp({ Model, views, variables });
    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    const onSessionEnded = simple.stub();
    voxaApp.onSessionEnded(onSessionEnded);

    return voxaApp.execute(event, AlexaReply)
      .then(() => {
        expect(onSessionEnded.called).to.be.true;
      });
  });

  it('should call onBeforeReplySent callbacks', () => {
    const voxaApp = new VoxaApp({ Model, views, variables });
    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    const onBeforeReplySent = simple.stub();
    voxaApp.onBeforeReplySent(onBeforeReplySent);

    return voxaApp.execute(event, AlexaReply)
      .then(() => {
        expect(onBeforeReplySent.called).to.be.true;
      });
  });

  it('should call entry on a LaunchRequest', () => {
    const voxaApp = new VoxaApp({ Model, views, variables });

    event.intent.name = 'LaunchIntent';
    statesDefinition.entry = simple.stub().resolveWith({
      to: 'die',
    });

    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    return voxaApp.execute(event, AlexaReply)
      .then(() => {
        expect(statesDefinition.entry.called).to.be.true;
      });
  });

  describe('onUnhandledState', () => {
    it('should give a proper error message when an intent is unhandled', () => {
      const voxaApp = new VoxaApp({ Model, views, variables });
      event.intent.name = 'LaunchIntent';
      voxaApp.onState('entry', { });

      return voxaApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(reply.error.message).to.equal('LaunchIntent went unhandled on entry state');
        });
    });

    it('should call onUnhandledState callbacks when the state machine transition throws a UnhandledState error', () => {
      const voxaApp = new VoxaApp({ Model, views, variables });
      const onUnhandledState = simple.stub().resolveWith({
        reply: 'ExitIntent.Farewell',
      });

      voxaApp.onUnhandledState(onUnhandledState);

      event.intent.name = 'LaunchIntent';
      statesDefinition.entry = simple.stub().resolveWith(null);

      _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
      return voxaApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(onUnhandledState.called).to.be.true;
          expect(reply.response.statements[0]).to.equal('Ok. For more info visit example.com site.');
        });
    });
  });

  it('should include all directives in the reply', () => {
    const voxaApp = new VoxaApp({ Model, variables, views });

    const directives = [playAudio('url', '123', 0, 'REPLACE_ALL')]

    voxaApp.onIntent('SomeIntent', () => ({
      reply: 'ExitIntent.Farewell',
      to: 'entry',
      directives,
    }));

    return voxaApp.execute(event, AlexaReply)
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
    const voxaApp = new VoxaApp({ Model, variables, views });

    const directives = [playAudio('url', '123', 0, 'REPLACE_ALL')]

    voxaApp.onIntent('SomeIntent', () => ({
      reply: 'ExitIntent.Farewell',
      directives,
    }));

    return voxaApp.execute(event, AlexaReply)
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
    const voxaApp = new VoxaApp({ Model, views, variables });

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

    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(reply.response.statements).to.deep.equal(['0', '1']);
      });
  });

  it('should call onIntentRequest callbacks before the statemachine', () => {
    const voxaApp = new VoxaApp({ Model, views, variables });
    _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
    const stubResponse = 'STUB RESPONSE';
    const stub = simple.stub().resolveWith(stubResponse);
    voxaApp.onIntentRequest(stub);

    return voxaApp.execute(event, AlexaReply)
      .then((reply) => {
        expect(stub.called).to.be.true;
        expect(reply).to.not.equal(stubResponse);
        expect(reply.response.statements[0]).to.equal('Ok. For more info visit example.com site.');
      });
  });

  describe('onAfterStateChanged', () => {
    it('should return the onError response for exceptions thrown in onAfterStateChanged', () => {
      const voxaApp = new VoxaApp({ Model, views, variables });
      _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
      const spy = simple.spy(() => {
        throw new Error('FAIL!');
      });

      voxaApp.onAfterStateChanged(spy);

      return voxaApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(spy.called).to.be.true;
          expect(reply.error).to.be.an('error');
        });
    });
  });

  describe('onRequestStarted', () => {
    it('should return the onError response for exceptions thrown in onRequestStarted', () => {
      const voxaApp = new VoxaApp({ Model, views, variables });
      const spy = simple.spy(() => {
        throw new Error('FAIL!');
      });

      voxaApp.onRequestStarted(spy);

      return voxaApp.execute(event, AlexaReply)
        .then((reply) => {
          expect(spy.called).to.be.true;
          expect(reply.error).to.be.an('error');
        });
    });
  });
});
