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

  it('should find users on the context', () => {
    const alexaEvent = new AlexaEvent({ context: { System: { user: { userId: 'Fried Chicken' } } }, request: { } });
    expect(alexaEvent.user.userId).to.equal('Fried Chicken');
  });

  it('should find users on the session', () => {
    // The Echo simulator from the test menu doesn't provide the context, so this is necessary
    const alexaEvent = new AlexaEvent({ session: { user: { userId: 'Fried Chicken' } }, request: { } });
    expect(alexaEvent.user.userId).to.equal('Fried Chicken');
  });
});
