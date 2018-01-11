'use strict';
const expect = require('chai').expect;
const VoxaApp = require('../src/VoxaApp').VoxaApp;
const VoxaAdapter = require('../src/adapters/VoxaAdapter').VoxaAdapter;
const views = require('./views');
const AlexaRequestBuilder = require('./tools').AlexaRequestBuilder;
describe('VoxaAdapter', () => {
    describe('lambda', () => {
        it('should call the execute method with the event and context', (done) => {
            const app = new VoxaApp({ views });
            const adapter = new VoxaAdapter(app);
            const handler = adapter.lambda();
            const event = new AlexaRequestBuilder().getSessionEndedRequest();
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
//# sourceMappingURL=VoxaAdapter.spec.js.map