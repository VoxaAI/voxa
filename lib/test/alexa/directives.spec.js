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
const VoxaApp_1 = require("../../src/VoxaApp");
const directives_1 = require("./../../src/adapters/alexa/directives");
const tools_1 = require("./../tools");
const views = require("./../views");
chai_1.use(chaiAsPromised);
describe("Alexa directives", () => {
    let event;
    let app;
    let alexaSkill;
    before(() => {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views,
        });
    });
    beforeEach(() => {
        const rb = new tools_1.AlexaRequestBuilder();
        event = rb.getIntentRequest("AMAZON.YesIntent");
        app = new VoxaApp_1.VoxaApp({ views });
        alexaSkill = new AlexaAdapter_1.AlexaAdapter(app);
    });
    describe("HomeCard", () => {
        it("should be usable from the directives", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("YesIntent", () => {
                return {
                    directives: [directives_1.HomeCard("Card")],
                };
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
            app.onIntent("YesIntent", () => {
                return { HomeCard: "Card" };
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
            app.onIntent("YesIntent", () => {
                return {
                    HomeCard: "Card",
                    directives: [directives_1.HomeCard("Card")],
                };
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