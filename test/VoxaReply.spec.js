'use strict';

const expect = require('chai').expect;
const _ = require('lodash');
const VoxaReply = require('../src/VoxaReply').VoxaReply;
const AlexaEvent = require('../src/adapters/alexa/AlexaEvent').AlexaEvent;
const tools = require('./tools');

const rb = new tools.AlexaRequestBuilder();

describe('VoxaReply', () => {
  let reply;
  beforeEach(() => {
    reply = new VoxaReply(new AlexaEvent(rb.getIntentRequest('SomeIntent')));
  });

  it('should throw an error if first argument is not an alexaEvent', () => {
    expect(() => new VoxaReply()).to.throw(Error);
  });

  it('should add the request session to itself on constructor', () => {
    const event = rb.getIntentRequest('SomeIntent');
    rb.session = { key1: 'value1', key2: 'value2' };
    const request = new AlexaEvent(event);
    const sessionReply = new VoxaReply(request);
    expect(sessionReply.session).to.deep.equal(request.session);
  });

  it('should determine if it has directive', () => {
    reply.response.directives = [{ type: 'a' }];

    expect(reply.hasDirective('a')).to.be.true;
    expect(reply.hasDirective(/^a/)).to.be.true;
    expect(reply.hasDirective(directive => directive.type === 'a')).to.be.true;

    expect(reply.hasDirective('b')).to.be.false;
    expect(reply.hasDirective(/^b/)).to.be.false;
    expect(reply.hasDirective(directive => directive.type === 'b')).to.be.false;
  });

  it('should throw error on unknown comparison for has directive', () => {
    reply.response.directives = [{ type: 'a' }];

    expect(() => reply.hasDirective({})).to.throw(Error);
  });

  it('should set yield to true on yield', () => {
    reply.yield();
    expect(reply.response.yield).to.be.true;
  });

});
