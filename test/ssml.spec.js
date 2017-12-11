'use strict';

const expect = require('chai').expect;
const ssml = require('../lib/ssml');

describe('ssml', () => {
  describe('toSSML', () => {
    it('should return undefined if empty statement', () => {
      expect(ssml.toSSML()).to.be.undefined;
    });

    it('should not double wrap ssml with <speak /> tags', () => {
      expect(ssml.toSSML('<speak>Some Text</speak>')).to.equal('<speak>Some Text</speak>');
    });

    it('should escape &', () => {
      expect(ssml.toSSML('Some & Some')).to.equal('<speak>Some &amp; Some</speak>');
    });
  });
});
