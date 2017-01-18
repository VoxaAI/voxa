'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;
const AlexaSkill = require('../lib2/AlexaSkill');
const simple = require('simple-mock');

describe('AlexaSkill', () => {
  it('should throw an exception on wrong appId', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});
    const promise = alexaSkill.execute({ session: { application: { applicationId: 'OTHER APP ID' } } });
    return expect(promise).to.eventually.be.rejectedWith(Error, 'Invalid applicationId');
  });

  it('should throw an exception if onLaunch is not overriden', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    const promise = alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'IntentRequest', intent: { slots: [], name: 'UnsupportedIntent' } } }, context);
    return expect(promise).to.eventually.be.rejectedWith(Error, 'onLaunch must be implemented');
  });

  it('should throw an exception on unknown event type', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});
    const promise = alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'UnknownEvent' } }, context);
    return expect(promise).to.eventually.be.rejectedWith(Error, 'Unkown event type');
  });

  it('should throw an exception on Unsupported intent', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});
    const promise = alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'IntentRequest', intent: { slots: [], name: 'UnsupportedIntent' } } }, context);
    return expect(promise).to.eventually.be.rejectedWith(Error, 'Unsupported intent = UnsupportedIntent');
  });

  it('should succedd with version on onSessionEnded request', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});
    const promise = alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context);
    expect(promise).to.eventually.deep.equal({ version: '1.0' });
  });

  it('should call onSesionEnded callback', (done) => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});
    const stub = simple.stub().returnWith(1);
    alexaSkill.onSessionEnded(stub);

    alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context)
      .then(() => {
        expect(stub.called).to.be.true;
        done();
      })
      .catch(done);
  });

  it('should accept onRequestStart methods', () => {
    const alexaSkill = new AlexaSkill('appId');
    const onRequestStart = simple.stub();
    alexaSkill.onRequestStarted(onRequestStart);
  });

  it('should not call onSessionStarted if not session.new', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});
    const stub = simple.stub().resolveWith(1);
    alexaSkill.onSessionStarted(stub);

    return alexaSkill.execute({ session: { new: false, application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context)
      .then(() => {
        expect(stub.callCount).to.equal(0);
      });
  });

  it('should call onSessionStarted if session.new', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});
    const stub = simple.stub().resolveWith(1);
    alexaSkill.onSessionStarted(stub);

    return alexaSkill.execute({ session: { new: true, application: { applicationId: 'MY APP ID' } }, request: { type: 'SessionEndedRequest' } }, context)
      .then(() => {
        expect(stub.callCount).to.equal(1);
      });
  });

  it('should call all onRequestStartCallbacks', () => {
    const alexaSkill = new AlexaSkill('appId');
    alexaSkill.onLaunch(() => {});
    const onRequestStart1 = simple.stub().returnWith(1);
    const onRequestStart2 = simple.stub().returnWith(1);
    const onRequestStart3 = simple.stub().returnWith(1);

    alexaSkill.onRequestStarted(onRequestStart1);
    alexaSkill.onRequestStarted(onRequestStart2);
    alexaSkill.onRequestStarted(onRequestStart3);

    return alexaSkill.execute({ session: { new: true, application: { applicationId: 'appId' } }, request: { type: 'SessionEndedRequest' } }, context, context)
      .then(() => {
        expect(onRequestStart1.called).to.be.true;
        expect(onRequestStart2.called).to.be.true;
        expect(onRequestStart3.called).to.be.true;
      });
  });

  it('should  call the correct intentHandler', () => {
    const alexaSkill = new AlexaSkill('MY APP ID');
    alexaSkill.onLaunch(() => {});

    alexaSkill.intentHandlers.StartIntent = simple.stub();

    return alexaSkill.execute({ session: { application: { applicationId: 'MY APP ID' } }, request: { type: 'IntentRequest', intent: { slots: [], name: 'StartIntent' } } }, context)
      .then(() => {
        expect(alexaSkill.intentHandlers.StartIntent.called).to.be.true;
      });
  });
});
