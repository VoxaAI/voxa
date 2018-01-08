'use strict';
const expect = require('chai').expect;
const DialogFlowAdapter = require('../../src/adapters/dialog-flow/DialogFlowAdapter').DialogFlowAdapter;
const VoxaApp = require('../../src/VoxaApp').VoxaApp;
const views = require('../views');
const VoxaReply = require('../../src/VoxaReply').VoxaReply;
const DialogFlowEvent = require('../../src/adapters/dialog-flow/DialogFlowEvent').DialogFlowEvent;
describe('DialogFlowAdapter', () => {
    describe('execute', () => {
        it('should convert the voxaReply to a Dialog Flow response', () => {
            const rawEvent = require('../requests/dialog-flow/launchIntent.json');
            const voxaApp = new VoxaApp({ views });
            voxaApp.onIntent('LaunchIntent', () => ({ reply: 'LaunchIntent.OpenResponse' }));
            const adapter = new DialogFlowAdapter(voxaApp);
            return adapter.execute(rawEvent)
                .then((reply) => {
                expect(reply.data.google.richResponse.items[0].simpleResponse.ssml).to.equal('<speak>Hello from DialogFlow</speak>');
            });
        });
    });
    describe('google', () => {
        it('should add the google card', () => {
            const rawEvent = require('../requests/dialog-flow/launchIntent.json');
            const event = new DialogFlowEvent(rawEvent);
            const reply = new VoxaReply(event);
            reply.response.statements.push('Hi!');
            reply.response.directives.push({ basicCard: {
                    title: 'Title', subtitle: 'Subtitle', formattedText: 'The text', buttons: [{ title: 'ButtonTitle', openUrlAction: { url: 'https://example.com' } }],
                } });
            expect(DialogFlowAdapter.google(reply)).to.deep.equal({
                expectUserResponse: false,
                isSsml: true,
                noInputPrompts: [],
                possibleIntents: undefined,
                richResponse: {
                    items: [
                        {
                            simpleResponse: {
                                ssml: '<speak>Hi!</speak>',
                            },
                        },
                        {
                            basicCard: {
                                formattedText: 'The text',
                                subtitle: 'Subtitle',
                                title: 'Title',
                                buttons: [
                                    {
                                        openUrlAction: {
                                            url: 'https://example.com',
                                        },
                                        title: 'ButtonTitle',
                                    },
                                ],
                            },
                        },
                    ],
                    linkOutSuggestion: undefined,
                    suggestions: [],
                },
            });
        });
    });
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
//# sourceMappingURL=DialogFlowAdapter.spec.js.map