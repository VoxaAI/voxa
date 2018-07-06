"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const i18n = require("i18next");
const _ = require("lodash");
require("mocha");
const AlexaPlatform_1 = require("../../src/platforms/alexa/AlexaPlatform");
const DisplayTemplateBuilder_1 = require("../../src/platforms/alexa/DisplayTemplateBuilder");
const VoxaApp_1 = require("../../src/VoxaApp");
const directives_1 = require("./../../src/platforms/alexa/directives");
const tools_1 = require("./../tools");
const variables_1 = require("./../variables");
const views_1 = require("./../views");
describe("Alexa directives", () => {
    let event;
    let app;
    let alexaSkill;
    before(() => {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    beforeEach(() => {
        const rb = new tools_1.AlexaRequestBuilder();
        app = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables });
        alexaSkill = new AlexaPlatform_1.AlexaPlatform(app);
        event = rb.getIntentRequest("AMAZON.YesIntent");
    });
    describe("RenderTemplate", () => {
        it("should only add the template if request supports it", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaRenderTemplate: "RenderTemplate",
                to: "die",
            });
            event.context.System.device.supportedInterfaces = {};
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives).to.be.undefined;
        }));
        it("should support adding a template directly", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", () => {
                const template = new DisplayTemplateBuilder_1.DisplayTemplate("BodyTemplate1");
                return {
                    alexaRenderTemplate: template,
                };
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives).to.not.be.undefined;
            chai_1.expect(JSON.parse(JSON.stringify(reply.response.directives))).to.deep.equal([{
                    template: {
                        type: "BodyTemplate1",
                    },
                    type: "Display.RenderTemplate",
                }]);
        }));
        it("should add to the directives", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaRenderTemplate: "RenderTemplate",
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives).to.not.be.undefined;
            chai_1.expect(reply.response.directives).to.deep.equal([{
                    template: {
                        backButton: "VISIBLE",
                        backgroundImage: "Image",
                        textContent: {
                            primaryText: {
                                text: "string",
                                type: "string",
                            },
                            secondaryText: {
                                text: "string",
                                type: "string",
                            },
                            tertiaryText: {
                                text: "string",
                                type: "string",
                            },
                        },
                        title: "string",
                        token: "string",
                        type: "BodyTemplate1",
                    },
                    type: "Display.RenderTemplate",
                }]);
        }));
    });
    describe("Hint", () => {
        it("should render a Hint directive", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaHint: "Hint",
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives).to.deep.equal([{
                    hint: {
                        text: "string",
                        type: "PlainText",
                    },
                    type: "Hint",
                }]);
        }));
    });
    describe("StopAudio", () => {
        it("should render an AudioPlayer.Stop directive", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaStopAudio: undefined,
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives).to.deep.equal([{
                    type: "AudioPlayer.Stop",
                }]);
        }));
    });
    describe("AccountLinkingCard", () => {
        it("should render an AccountLinkingCard", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaAccountLinkingCard: undefined,
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.card).to.deep.equal({
                type: "LinkAccount",
            });
        }));
    });
    describe("DialogDelegate", () => {
        it("should render a DialogDelegate directive", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaDialogDelegate: undefined,
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives).to.deep.equal([{
                    type: "Dialog.Delegate",
                }]);
        }));
    });
    describe("HomeCard", () => {
        it("should be usable from the directives", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                directives: [new directives_1.HomeCard("Card")],
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.card).to.deep.equal({
                image: {
                    largeImageUrl: "https://example.com/large.jpg",
                    smallImageUrl: "https://example.com/small.jpg",
                },
                title: "Title",
                type: "Standard",
            });
        }));
        it("should render the home card", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaCard: "Card",
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.card).to.deep.equal({
                image: {
                    largeImageUrl: "https://example.com/large.jpg",
                    smallImageUrl: "https://example.com/small.jpg",
                },
                title: "Title",
                type: "Standard",
            });
        }));
        it("should render faile if variable doesn't return a card like object", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", () => ({
                alexaCard: "Card2",
                to: "die",
            }));
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.card).to.be.undefined;
            chai_1.expect(_.get(reply, "response.outputSpeech.ssml")).to.include("An unrecoverable error");
        }));
        it("should not allow more than one card", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                alexaCard: "Card",
                directives: [new directives_1.HomeCard("Card")],
                to: "entry",
            });
            app.onError((request, error) => {
                chai_1.expect(error.message).to.equal("At most one card can be specified in a response");
            });
            const reply = yield alexaSkill.execute(event, {});
            if (!reply.response.outputSpeech) {
                throw new Error("response missing");
            }
            chai_1.expect(_.get(reply.response, "outputSpeech.ssml")).to.equal("<speak>An unrecoverable error occurred.</speak>");
        }));
        it("should accept a HomeCard object", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", () => ({
                alexaCard: {
                    image: {
                        largeImageUrl: "https://example.com/large.jpg",
                        smallImageUrl: "https://example.com/small.jpg",
                    },
                    title: "Title",
                    type: "Standard",
                },
                flow: "yield",
                to: "entry",
            }));
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.card).to.deep.equal({
                image: {
                    largeImageUrl: "https://example.com/large.jpg",
                    smallImageUrl: "https://example.com/small.jpg",
                },
                title: "Title",
                type: "Standard",
            });
        }));
    });
});
//# sourceMappingURL=directives.spec.js.map