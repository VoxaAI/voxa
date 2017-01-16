'use strict';

const expect = require('chai').expect;
const AlexaSkill = require('../lib2/AlexaSkill');
const simple = require('simple-mock');

describe('AlexaSkill', () => {
  it('should throw an exception on wrong appId', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const fn = function execute() {
      return alexaSkill.execute({ session: { application: { applicationId: 'OTHER APP ID' } } });
    };

    expect(fn).to.throw(Error);
  });

  it('should throw an exception if onLaunch is not overriden', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const context = {
      fail: (err) => {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('onLaunch should be overriden by subclass');
        done();
      },
    };
    alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'LaunchRequest' } }, context);
  });

  it('should throw an exception on unknown event type', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const context = {
      fail: (err) => {
        expect(err).to.be.an('error');
        expect(err.message).to.equal('Unkown event type');
        done();
      },
    };
    alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'UnknownEvent' } }, context);
  });

  it('should throw an exception on Unsupported intent', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const context = {
      fail: (err) => {
        expect(err).to.be.an('error');
        done();
      },
    };
    alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'IntentRequest', intent: { slots: [], name: 'UnsupportedIntent' } } }, context);
  });

  it('should succedd with version on onSessionEnded request', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const context = {
      succeed: (msg) => {
        expect(msg).to.deep.equal({ version: '1.0' });
        done();
      },
      fail: done,
    };
    alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context);
  });

  it('should call onSesionEnded callback', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const stub = simple.stub().returnWith(1);
    alexaSkill.onSessionEnded(stub);
    const context = {
      succeed: () => {
        expect(stub.called).to.be.true;
        done();
      },
      fail: done,
    };
    alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context);
  });

  it('should accept onRequestStart methods', () => {
    const alexaSkill = new AlexaSkill('appId');
    const onRequestStart = simple.stub();
    alexaSkill.onRequestStarted(onRequestStart);
  });

  it('should not call onSessionStarted if not session.new', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const stub = simple.stub().resolveWith(1);
    alexaSkill.onSessionStarted(stub);
    const context = {
      succeed: () => {
        expect(stub.callCount).to.equal(0);
        done();
      },
      fail: done,
    };
    alexaSkill.execute({ session: { new: false, application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context);
  });

  it('should call onSessionStarted if session.new', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const stub = simple.stub().resolveWith(1);
    alexaSkill.onSessionStarted(stub);
    const context = {
      succeed: () => {
        expect(stub.callCount).to.equal(1);
        done();
      },
      fail: done,
    };
    alexaSkill.execute({ session: { new: true, application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context);
  });

  it('should call all onRequestStartCallbacks', (done) => {
    const alexaSkill = new AlexaSkill('appId');
    const onRequestStart1 = simple.stub().returnWith(1);
    const onRequestStart2 = simple.stub().returnWith(1);
    const onRequestStart3 = simple.stub().returnWith(1);

    alexaSkill.onRequestStarted(onRequestStart1);
    alexaSkill.onRequestStarted(onRequestStart2);
    alexaSkill.onRequestStarted(onRequestStart3);

    const context = {
      succeed: () => {
        expect(onRequestStart1.called).to.be.true;
        expect(onRequestStart2.called).to.be.true;
        expect(onRequestStart3.called).to.be.true;
        done();
      },
      fail: done,
    };

    alexaSkill.execute({ session: { new: true, application: { applicationId: 'appId' } }, request: { type: 'SessionEndedRequest' } }, context, context);
  });

  it('should  call the correct intentHandler', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const context = {
      succeed: () => {
        done();
      },
      fail: done,
    };

    alexaSkill.intentHandlers.StartIntent = function StartIntent(request) {
      request.lambdaContext.succeed();
    };

    alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'IntentRequest', intent: { slots: [], name: 'StartIntent' } } }, context);
  });
});
