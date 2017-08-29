'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const VoxaApp = require('../lib/VoxaApp');
const simple = require('simple-mock');
const _ = require('lodash');
const AlexaEvent = require('../lib/adapters/alexa/AlexaEvent');

describe('VoxaApp', () => {
  it('should return error message on wrong appId if config.appIds is defined', () => {
    const voxaApp = new VoxaApp({ appIds: ['MY APP ID'] });
    voxaApp.onLaunchRequest(() => {});
    const stub = simple.stub();
    voxaApp.onError(stub);

    return voxaApp.execute(new AlexaEvent({ context: { application: { applicationId: 'OTHER APP ID' } }, request: { intent: { } } }))
      .then((reply) => {
        expect(stub.called).to.be.true;
        expect(stub.lastCall.args[1]).to.be.an('error');
        expect(stub.lastCall.args[1].message).to.equal('Invalid applicationId');
        expect(reply.msg.statements[0]).to.equal('An unrecoverable error occurred.');
      });
  });

  it('should iterate through error handlers and return the first with a truthy response', () => {
    const voxaApp = new VoxaApp();
    voxaApp.onLaunchRequest(() => {});

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

    return voxaApp.execute({})
      .then((response) => {
        expect(handler1.called).to.be.true;
        expect(handler2.called).to.be.true;
        expect(handler3.called).to.be.true;
        expect(response).to.deep.equal(handler3());
      });
  });


  it('should succeed with version on onSessionEnded request', () => {
    const voxaApp = new VoxaApp({ appIds: 'MY APP ID' });
    voxaApp.onLaunchRequest(() => {});
    const promise = voxaApp.execute(new AlexaEvent({ context: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }));
    return expect(promise).to.eventually.deep.equal({ version: '1.0' });
  });

  it('should call onSesionEnded callback', (done) => {
    const voxaApp = new VoxaApp({ appIds: 'MY APP ID' });
    voxaApp.onLaunchRequest(() => {});
    const stub = simple.stub().returnWith(1);
    voxaApp.onSessionEnded(stub);
    voxaApp.execute(new AlexaEvent({ context: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }))
      .then(() => {
        expect(stub.called).to.be.true;
        done();
      })
      .catch(done);
  });

  it('should accept onRequestStart methods', () => {
    const voxaApp = new VoxaApp({ appIds: 'MY APP ID' });
    const onRequestStart = simple.stub();
    voxaApp.onRequestStarted(onRequestStart);
  });

  it('should not call onSessionStarted if not session.new', () => {
    const voxaApp = new VoxaApp({ appIds: 'MY APP ID' });
    voxaApp.onLaunchRequest(() => {});
    const stub = simple.stub().resolveWith(1);
    voxaApp.onSessionStarted(stub);

    return voxaApp.execute(new AlexaEvent({ session: { new: false }, context: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }))
      .then(() => {
        expect(stub.callCount).to.equal(0);
      });
  });

  it('should call onSessionStarted if session.new', () => {
    const voxaApp = new VoxaApp({ appIds: 'MY APP ID' });
    voxaApp.onLaunchRequest(() => {});
    const stub = simple.stub().resolveWith(1);
    voxaApp.onSessionStarted(stub);

    return voxaApp.execute(new AlexaEvent({ session: { new: true }, context: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }))
      .then(() => {
        expect(stub.callCount).to.equal(1);
      });
  });

  it('should call all onRequestStartCallbacks', () => {
    const voxaApp = new VoxaApp({ appIds: 'appId' });
    voxaApp.onLaunchRequest(() => {});
    const onRequestStart1 = simple.stub().returnWith(1);
    const onRequestStart2 = simple.stub().returnWith(1);
    const onRequestStart3 = simple.stub().returnWith(1);

    voxaApp.onRequestStarted(onRequestStart1);
    voxaApp.onRequestStarted(onRequestStart2);
    voxaApp.onRequestStarted(onRequestStart3);

    return voxaApp.execute(new AlexaEvent({ session: { new: true }, context: { application: { applicationId: 'appId' } }, request: { type: 'SessionEndedRequest' } }))
      .then(() => {
        expect(onRequestStart1.called).to.be.true;
        expect(onRequestStart2.called).to.be.true;
        expect(onRequestStart3.called).to.be.true;
      });
  });

  it('should accept an array of appIds', () => {
    const voxaApp = new VoxaApp({ appIds: ['appId1', 'appId2'] });
    voxaApp.onLaunchRequest(() => {});
    return voxaApp.execute(new AlexaEvent({ session: { new: true }, context: { application: { applicationId: 'appId2' } }, request: { type: 'SessionEndedRequest' } }));
  });
});
