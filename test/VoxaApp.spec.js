'use strict';

const chai = require('chai');
const _ = require('lodash');
const simple = require('simple-mock');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const Voxa = require('../src/VoxaApp').VoxaApp;
const AlexaEvent = require('../src/adapters/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../src/adapters/alexa/AlexaReply').AlexaReply;
const AlexaAdapter = require('../src/adapters/alexa/AlexaAdapter').AlexaAdapter;
const views = require('./views');
const tools = require('./tools');

const rb = new tools.AlexaRequestBuilder();


describe('VoxaApp', () => {
  it('should return error message on wrong appId if config.appIds is defined', () => {
    const voxaApp = new Voxa({ appIds: ['MY APP ID'], views });
    const stub = simple.stub();
    voxaApp.onError(stub);

    return voxaApp.execute(new AlexaEvent({ context: { application: { applicationId: 'OTHER APP ID' } }, request: { intent: { name: 'SomeIntent' } } }), AlexaReply)
      .then((reply) => {
        console.log({ reply })
        expect(reply.error).to.be.an('error');
        expect(stub.called).to.be.true;
        expect(stub.lastCall.args[1]).to.be.an('error');
        expect(stub.lastCall.args[1].message).to.equal('Invalid applicationId');
        expect(reply.response.statements[0]).to.equal('An unrecoverable error occurred.');
      });
  });

  it('should return error message on wrong appId if config.appIds is defined', () => {
    const voxaApp = new Voxa({ appIds: 'MY APP ID', views });
    const stub = simple.stub();
    voxaApp.onError(stub);

    return voxaApp.execute(new AlexaEvent({ context: { application: { applicationId: 'OTHER APP ID' } }, request: { intent: { name: 'SomeIntent' } } }), AlexaReply)
      .then((reply) => {
        expect(stub.called).to.be.true;
        expect(stub.lastCall.args[1]).to.be.an('error');
        expect(stub.lastCall.args[1].message).to.equal('Invalid applicationId');
        expect(reply.response.statements[0]).to.equal('An unrecoverable error occurred.');
      });
  });

  it('should iterate through error handlers and return the first with a truthy response', () => {
    const voxaApp = new Voxa({ views });

    const handler1 = simple.stub().returnWith(null);
    const handler2 = simple.stub().returnWith(null);
    const handler3 = simple.stub().returnWith({
      version: '1.0',
      response: {
        card: undefined,
        outputSpeech: {
          ssml: '<speak>An unrecoverable error occurred.</speak>',
          type: 'SSML',
        },
        shouldEndSession: true,
      },
    });

    voxaApp.onError(handler1);
    voxaApp.onError(handler2);
    voxaApp.onError(handler3);

    return voxaApp.execute({}, AlexaReply)
      .then((response) => {
        expect(handler1.called).to.be.true;
        expect(handler2.called).to.be.true;
        expect(handler3.called).to.be.true;
        expect(response).to.deep.equal(handler3());
      });
  });


  it('should succeed with version on onSessionEnded request', () => {
    const voxaApp = new Voxa({ views });
    const alexaSkill = new AlexaAdapter(voxaApp);
    const promise = alexaSkill.execute(new AlexaEvent(rb.getSessionEndedRequest()));
    return expect(promise).to.eventually.deep.equal({ version: '1.0', response: {} });
  });

  it('should return error message on error in SessionEndedRequest', () => {
    const voxaApp = new Voxa({ views });
    const alexaSkill = new AlexaAdapter(voxaApp);

    const stub = simple.stub();
    voxaApp.onError(stub);
    return alexaSkill.execute({ context: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest', reason: 'ERROR', error: 'The total duration of audio content exceeds the maximum allowed duration' } })
      .then((reply) => {
        expect(stub.lastCall.args[1]).to.be.an('error');
        expect(stub.lastCall.args[1].message).to.equal('Session ended with an error: The total duration of audio content exceeds the maximum allowed duration');
      });
  });

  it('should call onSesionEnded callback', (done) => {
    const voxaApp = new Voxa({ views });
    const stub = simple.stub().returnWith(1);
    voxaApp.onSessionEnded(stub);
    voxaApp.execute(new AlexaEvent(rb.getSessionEndedRequest()), AlexaReply)
      .then(() => {
        expect(stub.called).to.be.true;
        done();
      })
      .catch(done);
  });

  it('should accept onRequestStart methods', () => {
    const voxaApp = new Voxa({ views });
    const onRequestStart = simple.stub();
    voxaApp.onRequestStarted(onRequestStart);
  });

  it('should not call onSessionStarted if not session.new', () => {
    const voxaApp = new Voxa({ views });
    const stub = simple.stub().resolveWith(1);
    voxaApp.onSessionStarted(stub);

    return voxaApp.execute(new AlexaEvent({ session: { new: false }, context: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }), AlexaReply)
      .then(() => {
        expect(stub.callCount).to.equal(1);
      });
  });

  it('should call onSessionStarted if session.new', () => {
    const voxaApp = new Voxa({ views });
    const stub = simple.stub().resolveWith(1);
    voxaApp.onSessionStarted(stub);

    return voxaApp.execute(new AlexaEvent({ session: { new: true }, context: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }), AlexaReply)
      .then(() => {
        expect(stub.callCount).to.equal(1);
      });
  });

  it('should call all onRequestStartCallbacks', () => {
    const voxaApp = new Voxa({ views });
    const onRequestStart1 = simple.stub().returnWith(1);
    const onRequestStart2 = simple.stub().returnWith(1);
    const onRequestStart3 = simple.stub().returnWith(1);

    voxaApp.onRequestStarted(onRequestStart1);
    voxaApp.onRequestStarted(onRequestStart2);
    voxaApp.onRequestStarted(onRequestStart3);

    return voxaApp.execute(new AlexaEvent({ session: { new: true }, context: { application: { applicationId: 'appId' } }, request: { type: 'SessionEndedRequest' } }), AlexaReply)
      .then(() => {
        expect(onRequestStart1.called).to.be.true;
        expect(onRequestStart2.called).to.be.true;
        expect(onRequestStart3.called).to.be.true;
      });
  });

  it('should accept an array of appIds', () => {
    const voxaApp = new Voxa({ appIds: ['appId1', 'appId2'], views });
    return voxaApp.execute(new AlexaEvent(rb.getSessionEndedRequest()), AlexaReply);
  });
});
