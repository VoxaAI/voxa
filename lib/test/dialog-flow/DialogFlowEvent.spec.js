'use strict';
const expect = require('chai').expect;
const DialogFlowEvent = require('../../src/adapters/dialog-flow/DialogFlowEvent').DialogFlowEvent;
const rawIntent = require('../requests/dialog-flow/pizzaIntent.json');
const fallbackIntent = require('../requests/dialog-flow/fallbackIntent.json');
describe('DialogFlowEvent', () => {
    it('should assign all event.request properties', () => {
        const event = new DialogFlowEvent(rawIntent);
        expect(event.result.metadata.intentId).to.equal('f55822e1-b76b-4907-b71d-d10e112a636c');
    });
    it('should format intent slots', () => {
        const event = new DialogFlowEvent(rawIntent);
        expect(event.intent.params).to.deep.equal({ number: '2', size: 'large', waterContent: '' });
    });
    it('should find users on the session', () => {
        const event = new DialogFlowEvent(fallbackIntent);
        expect(event.user.userId).to.equal('AI_yXq_n6kfU8IUzovfYOmX-j5Z3');
    });
    it('should format session parameters', () => {
        const event = new DialogFlowEvent(fallbackIntent);
        expect(event.session.attributes).to.deep.equal({
            actions_capability_audio_output: {},
            actions_capability_screen_output: {},
            google_assistant_input_type_keyboard: {},
            model: {
                command: {
                    buy: 0,
                    feed: 0,
                    plant: 0,
                },
            },
            state: 'die',
        });
    });
});
//# sourceMappingURL=DialogFlowEvent.spec.js.map