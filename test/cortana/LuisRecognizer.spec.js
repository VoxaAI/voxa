'use strict';

const expect = require('chai').expect;
const rp = require('request-promise');
const simple = require('simple-mock');
const CortanaEvent = require('../../lib/adapters/cortana/CortanaEvent');
const luisResponse = require('../requests/cortana/luis.json');
const rawEvent = require('../requests/cortana/StaintIntent.json');

let LuisRecognizer;

describe('LuisRecognizer', () => {
  beforeEach(() => {
    simple.mock(rp, 'call').resolveWith(luisResponse);
    LuisRecognizer = require('../../lib/adapters/cortana/LuisRecognizer');
  });

  afterEach(() => {
    simple.restore();
  });

  describe('recognize', () => {
    it('should return an instance of a CortanaEvent', () => {
      const recognizer = new LuisRecognizer('http://example.com');
      return recognizer.recognize(rawEvent)
        .then((event) => {
          expect(event).to.be.an.instanceof(CortanaEvent);
        });
    });
  });

  describe('parseLuisResponse', () => {
    it('should transform the response to an intent name and params', () => {
      const event = LuisRecognizer.parseLuisResponse(luisResponse);
      expect(event.name).to.equal('SpecificStainIntent');
      expect(event.params.stainType).to.deep.equal(['Wine']);
    });
  });
});
