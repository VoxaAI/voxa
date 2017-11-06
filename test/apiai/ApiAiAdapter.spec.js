'use strict';

const expect = require('chai').expect;
const ApiAiEvent = require('../../lib/adapters/api-ai/ApiAiEvent');
const ApiAiAdapter = require('../../lib/adapters/api-ai/ApiAiAdapter');
const rawIntent = require('../requests/apiai/pizzaIntent.json');
const fallbackIntent = require('../requests/apiai/fallbackIntent.json');

describe('ApiAiAdapter', () => {
  describe('sessionToContext', () => {
    it('should transform a session map object to the apiai contextx format', () => {
      const contexts = ApiAiAdapter.sessionToContext({
        attributes: {
          model: {
            _state: 'someState',
          },
          otherAttribute: {
            someKey: 'someValue',
          },
          anEmptyAttribute: {},
          simpleAttribute: 'simpleValue',
        },
      });

      expect(contexts).to.deep.equal([{
        lifespan: 10000,
        name: 'model',
        parameters: {
          _state: 'someState',
        },
      }, {
        lifespan: 10000,
        name: 'otherAttribute',
        parameters: {
          someKey: 'someValue',
        },
      }, {
        lifespan: 10000,
        name: 'simpleAttribute',
        parameters: {
          simpleAttribute: 'simpleValue',
        },
      }]);
    });

    it('should return an empty context for an empty session', () => {
      const contexts = ApiAiAdapter.sessionToContext({});
      expect(contexts).to.deep.equal([]);
    });
  });
});

