'use strict';

const expect = require('chai').expect;
const AlexaEvent = require('../lib/AlexaEvent');

describe('AlexaEvent', () => {
  it('should assign all event.request properties', () => {
    const alexaEvent = new AlexaEvent({ request: { someProperty: 'someValue', someOtherProperty: 'someOtherValue' } });
    expect(alexaEvent.request.someProperty).to.equal('someValue');
    expect(alexaEvent.request.someOtherProperty).to.equal('someOtherValue');
  });

  it('should format intent slots', () => {
    const alexaEvent = new AlexaEvent({ request: { intent: { slots: [{ name: 'Dish', value: 'Fried Chicken' }] } } });
    expect(alexaEvent.intent.params).to.deep.equal({ Dish: 'Fried Chicken' });
  });

  it('should get token', () => {
    const alexaEvent = new AlexaEvent({ request: { token: 'some-token', intent: { slots: [{ name: 'Dish', value: 'Fried Chicken' }] } } });
    expect(alexaEvent.token).to.equal('some-token');
  });

  it('should find users on the context', () => {
    const alexaEvent = new AlexaEvent({ context: { System: { user: { userId: 'Fried Chicken' } } }, request: { } });
    expect(alexaEvent.user.userId).to.equal('Fried Chicken');
  });

  it('should find users on the session', () => {
    // The Echo simulator from the test menu doesn't provide the context, so this is necessary
    const alexaEvent = new AlexaEvent({ session: { user: { userId: 'Fried Chicken' } }, request: { } });
    expect(alexaEvent.user.userId).to.equal('Fried Chicken');
  });

  it('should set session attributes to an object on receiving a null value', () => {
    const alexaEvent = new AlexaEvent({
      session: { attributes: null },
      request: { },
    });
    expect(alexaEvent.session.attributes).to.deep.equal({});
  });
});
