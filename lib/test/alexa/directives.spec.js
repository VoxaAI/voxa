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
const chaiAsPromised = require("chai-as-promised");
const i18n = require("i18next");
require("mocha");
const AlexaAdapter_1 = require("../../src/adapters/alexa/AlexaAdapter");
const DisplayTemplateBuilder_1 = require("../../src/adapters/alexa/DisplayTemplateBuilder");
const VoxaApp_1 = require("../../src/VoxaApp");
const directives_1 = require("./../../src/adapters/alexa/directives");
const tools_1 = require("./../tools");
const views_1 = require("./../views");
chai_1.use(chaiAsPromised);
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
        event = rb.getIntentRequest("AMAZON.YesIntent");
        app = new VoxaApp_1.VoxaApp({ views: views_1.views });
        alexaSkill = new AlexaAdapter_1.AlexaAdapter(app);
    });
    describe("RenderTemplate", () => {
        it("should only add the template if request supports it", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                RenderTemplate: "RenderTemplate",
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
                    RenderTemplate: template,
                };
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives[0]).to.deep.equal({
                template: {
                    backButton: "VISIBLE",
                    type: "BodyTemplate1",
                },
                type: "Display.RenderTemplate",
            });
        }));
        it("should add to the directives", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                RenderTemplate: "RenderTemplate",
                to: "die",
            });
            const reply = yield alexaSkill.execute(event, {});
            chai_1.expect(reply.response.directives[0]).to.deep.equal({
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
            });
        }));
    });
    describe("Hint", () => {
        it("should only render a single Hint directive", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                Hint: "Hint",
                directives: [directives_1.Hint("Hint")],
                to: "entry",
            });
            app.onError((request, error) => {
                chai_1.expect(error.message).to.equal("At most one Hint directive can be specified in a response");
            });
            const reply = yield alexaSkill.execute(event, {});
            if (!reply.response.outputSpeech) {
                throw new Error("response missing");
            }
            chai_1.expect(reply.response.outputSpeech.ssml).to.equal("<speak>An unrecoverable error occurred.</speak>");
        }));
        it("should render a Hint directive", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                Hint: "Hint",
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
    describe("HomeCard", () => {
        it("should be usable from the directives", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                directives: [directives_1.HomeCard("Card")],
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
                HomeCard: "Card",
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
        it("should not allow more than one card", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", {
                HomeCard: "Card",
                directives: [directives_1.HomeCard("Card")],
                to: "entry",
            });
            app.onError((request, error) => {
                chai_1.expect(error.message).to.equal("At most one card can be specified in a response");
            });
            const reply = yield alexaSkill.execute(event, {});
            if (!reply.response.outputSpeech) {
                throw new Error("response missing");
            }
            chai_1.expect(reply.response.outputSpeech.ssml).to.equal("<speak>An unrecoverable error occurred.</speak>");
        }));
    });
});
//# sourceMappingURL=directives.spec.js.map