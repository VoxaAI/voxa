'use strict';

const expect = require('chai').expect;
const Request = require('../lib/Request');

describe('Request', () => {
  it('should assign all event.request properties', () => {
    const request = new Request({ request: { someProperty: 'someValue', someOtherProperty: 'someOtherValue' } });
    expect(request.request.someProperty).to.equal('someValue');
    expect(request.request.someOtherProperty).to.equal('someOtherValue');
  });

  it('should format intent slots', () => {
    const request = new Request({ request: { intent: { slots: [{ name: 'Dish', value: 'Fried Chicken' }] } } });
    expect(request.intentParams).to.deep.equal({ Dish: 'Fried Chicken' });
  });
});
