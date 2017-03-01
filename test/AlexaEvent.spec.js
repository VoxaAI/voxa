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
});
