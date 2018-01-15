'use strict';
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const simple = require('simple-mock');
const StateMachineApp = require('../../src/VoxaApp').VoxaApp;
const autoLoad = require('../../src/plugins/auto-load');
const views = require('../views').views;
const variables = require('../variables');
const AutoLoadAdapter = require('./autoLoadAdapter');
const AlexaEvent = require('../../src/adapters/alexa/AlexaEvent').AlexaEvent;
const AlexaReply = require('../../src/adapters/alexa/AlexaReply').AlexaReply;
const adapter = new AutoLoadAdapter();
describe('AutoLoad plugin', () => {
    let event;
    beforeEach(() => {
        event = new AlexaEvent({
            session: {
                user: {
                    userId: 'user-xyz',
                },
                new: true,
            },
            request: {
                locale: 'en-us',
                intent: {
                    name: 'LaunchIntent',
                },
                type: 'IntentRequest',
            },
        });
        simple.mock(AutoLoadAdapter.prototype, 'get')
            .resolveWith({ Id: 1 });
    });
    afterEach(() => {
        simple.restore();
    });
    it('should get data from adapter', () => {
        const skill = new StateMachineApp({ variables, views });
        autoLoad(skill, { adapter });
        const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
        skill.onIntent('LaunchIntent', spy);
        return skill.execute(event, AlexaReply)
            .then((result) => {
            expect(spy.called).to.be.true;
            expect(spy.lastCall.args[0].intent.name).to.equal('LaunchIntent');
            expect(result.response.statements).to.have.lengthOf(1);
            expect(result.response.statements[0]).to.contain('Hello! Good');
            expect(result.session.attributes.model.state).to.equal('die');
            expect(result.session.attributes.model.user.Id).to.equal(1);
        });
    });
    it('should throw error on getting data from adapter', () => {
        const skill = new StateMachineApp({ variables, views });
        autoLoad(skill, { adapter });
        const spy = simple.spy(() => ({ reply: 'LaunchIntent.OpenResponse' }));
        skill.onIntent('LaunchIntent', spy);
        simple.mock(adapter, 'get')
            .rejectWith(new Error('Random error'));
        return skill.execute(event, AlexaReply)
            .then((reply) => {
            expect(reply.session.attributes).to.be.empty;
            expect(reply.error).to.not.be.undefined;
            expect(reply.error.message).to.equal('Random error');
        });
    });
    it('should throw an error when no config is provided', () => {
        const skill = new StateMachineApp({ variables, views });
        const fn = () => { autoLoad(skill); };
        expect(fn).to.throw('Missing config object');
    });
    it('should throw an error when no adapter is set up in the config object', () => {
        const skill = new StateMachineApp({ variables, views });
        const fn = () => { autoLoad(skill, {}); };
        expect(fn).to.throw('Missing adapter');
    });
    it('should not get data from adapter when adapter has an invalid GET function', () => {
        simple.mock(adapter, 'get', undefined);
        const skill = new StateMachineApp({ variables, views });
        const fn = () => { autoLoad(skill, { adapter }); };
        expect(fn).to.throw('No get method to fetch data from');
    });
});
//# sourceMappingURL=auto-load.spec.js.map