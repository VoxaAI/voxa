'use strict';

const expect = require('chai').expect;
const VoxaApp = require('../lib/VoxaApp');
const VoxaAdapter = require('../lib/adapters/VoxaAdapter');
const simple = require('simple-mock');

describe('VoxaAdapter', () => {
  describe('lambda', () => {
    it('should raise an error if parameter is not a voxaApp', () => {
      expect(() => { const a = new VoxaAdapter(); }).to.throw(Error);
    });

    it('should call the execute method with the event and context', (done) => {
      const app = new VoxaApp();
      const adapter = new VoxaAdapter(app);
      const handler = adapter.lambda();
      const spy = simple.spy();
      const event = { event: 'event' };
      const context = { context: 'context' };

      adapter.execute = function execute(e, c) {
        return Promise.resolve({ event: e, context: c });
      };

      handler(event, context, (error, result) => {
        expect(error).to.be.null;
        expect(result.context).to.deep.equal(context);
        expect(result.event).to.deep.equal(event);
        done();
      });
    });
  });
});
