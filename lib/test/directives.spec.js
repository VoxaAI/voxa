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
const AlexaEvent_1 = require("../src/adapters/alexa/AlexaEvent");
const AlexaReply_1 = require("../src/adapters/alexa/AlexaReply");
const directives_1 = require("../src/directives");
const Renderer_1 = require("../src/renderers/Renderer");
const tools_1 = require("./tools");
const views = require("./views");
chai_1.use(chaiAsPromised);
describe("directives", () => {
    let response;
    let event;
    before(() => {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views,
        });
    });
    beforeEach(() => {
        const rb = new tools_1.AlexaRequestBuilder();
        const renderer = new Renderer_1.Renderer({ views });
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));
        event.t = i18n.getFixedT(event.request.locale);
        response = new AlexaReply_1.AlexaReply(event, renderer);
    });
    describe("reply", () => {
        it("should render arrays", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.reply(["Say.Say", "Question.Ask"])(response, event);
            chai_1.expect(response.response.statements).to.deep.equal(["say", "What time is it?"]);
        }));
        it("should fail to add after a yield arrays", () => {
            return chai_1.expect(directives_1.reply(["Question.Ask", "Question.Ask"])(response, event))
                .to.eventually.be.rejectedWith(Error, "Can't append to already yielding response");
        });
    });
    describe("tell", () => {
        it("should end the session", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.tell("Question.Ask.ask")(response, event);
            chai_1.expect(response.response.statements).to.deep.equal(["What time is it?"]);
            chai_1.expect(response.response.terminate).to.be.true;
        }));
    });
    describe("ask", () => {
        it("should render ask statements", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.ask("Question.Ask.ask")(response, event);
            chai_1.expect(response.response.statements).to.deep.equal(["What time is it?"]);
        }));
        it("should not terminate the session", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.ask("Question.Ask.ask")(response, event);
            chai_1.expect(response.response.terminate).to.be.false;
        }));
        it("should yield", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.ask("Question.Ask.ask")(response, event);
            chai_1.expect(response.isYielding()).to.be.true;
        }));
    });
    describe("say", () => {
        it("should render ask statements", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.say("Question.Ask.ask")(response, event);
            chai_1.expect(response.response.statements).to.deep.equal(["What time is it?"]);
        }));
        it("should not terminate the session", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.say("Question.Ask.ask")(response, event);
            chai_1.expect(response.response.terminate).to.be.false;
        }));
    });
    describe("reprompt", () => {
        it("should render reprompt statements", () => __awaiter(this, void 0, void 0, function* () {
            yield directives_1.reprompt("Question.Ask.ask")(response, event);
            chai_1.expect(response.response.reprompt).to.equal("What time is it?");
        }));
    });
});
//# sourceMappingURL=directives.spec.js.map