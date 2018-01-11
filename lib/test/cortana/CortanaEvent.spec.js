'use strict';
const expect = require('chai').expect;
const _ = require('lodash');
const CortanaEvent = require('../../src/adapters/cortana/CortanaEvent').CortanaEvent;
describe('CortanaEvent', () => {
    it('should map a Microsoft.Launch intent to a voxa LaunchIntent', () => {
        const rawEvent = _.cloneDeep(require('../requests/cortana/microsoft.launch.json'));
        const event = new CortanaEvent(rawEvent, {}, {});
        expect(event.request.type).to.equal('IntentRequest');
        expect(event.intent.name).to.equal('LaunchIntent');
    });
    it('should map an endOfConversation request to a voxa SessionEndedRequest', () => {
        const rawEvent = require('../requests/cortana/endOfRequest.json');
        const event = new CortanaEvent(rawEvent, {}, {}, null);
        expect(event.request.type).to.equal('SessionEndedRequest');
    });
});
//# sourceMappingURL=CortanaEvent.spec.js.map