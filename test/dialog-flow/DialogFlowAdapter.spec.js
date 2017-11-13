'use strict';

const expect = require('chai').expect;
const DialogFlowEvent = require('../../lib/adapters/dialog-flow/DialogFlowEvent');
const DialogFlowAdapter = require('../../lib/adapters/dialog-flow/DialogFlowAdapter');
const rawIntent = require('../requests/dialog-flow/pizzaIntent.json');
const fallbackIntent = require('../requests/dialog-flow/fallbackIntent.json');

describe('DialogFlowAdapter', () => {
  describe('sessionToContext', () => {
    it('should transform a session map object to the DialogFlow context format', () => {
      const contexts = DialogFlowAdapter.sessionToContext({
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
      const contexts = DialogFlowAdapter.sessionToContext({});
      expect(contexts).to.deep.equal([]);
    });
  });
});

