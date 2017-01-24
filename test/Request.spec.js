'use strict';

const expect = require('chai').expect;
const Request = require('../lib/Request');

describe('Request', () => {
  it('should assign all event.request properties', () => {
    const request = new Request({ request: { someProperty: 'someValue', someOtherProperty: 'someOtherValue' } });
    expect(request.someProperty).to.equal('someValue');
    expect(request.someOtherProperty).to.equal('someOtherValue');
  });

  it('should format intent slots', () => {
    const request = new Request({ request: { intent: { slots: [{ name: 'Dish', value: 'Fried Chicken' }] } } });
    expect(request.intent.params).to.deep.equal({ Dish: 'Fried Chicken' });
  });
});
