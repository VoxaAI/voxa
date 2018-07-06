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
require("mocha");
const directives_1 = require("../src/directives");
const AlexaEvent_1 = require("../src/platforms/alexa/AlexaEvent");
const AlexaReply_1 = require("../src/platforms/alexa/AlexaReply");
const directives_2 = require("../src/platforms/alexa/directives");
const Renderer_1 = require("../src/renderers/Renderer");
const tools_1 = require("./tools");
const variables_1 = require("./variables");
const views_1 = require("./views");
describe("directives", () => {
    let response;
    let event;
    before(() => {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    beforeEach(() => {
        const rb = new tools_1.AlexaRequestBuilder();
        const renderer = new Renderer_1.Renderer({ views: views_1.views, variables: variables_1.variables });
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));
        event.t = i18n.getFixedT(event.request.locale);
        event.renderer = renderer;
        response = new AlexaReply_1.AlexaReply();
    });
    describe("reply", () => {
        it("should pick up the directive statements", () => __awaiter(this, void 0, void 0, function* () {
            const transition = {};
            yield new directives_1.Reply("Reply.Directives").writeToReply(response, event, transition);
            chai_1.expect(transition.directives).to.have.lengthOf(1);
            chai_1.expect(transition.directives[0]).to.be.an.instanceof(directives_2.Hint);
            chai_1.expect(response.hasTerminated).to.be.false;
        }));
        it("should pick up the tell statements", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Reply("Reply.Tell").writeToReply(response, event, {});
            chai_1.expect(response.speech).to.deep.equal("<speak>this is a tell</speak>");
            chai_1.expect(response.hasTerminated).to.be.true;
        }));
        it("should pick up the ask statements", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Reply("Reply.Ask").writeToReply(response, event, {});
            chai_1.expect(response.speech).to.deep.equal("<speak>this is an ask</speak>");
            chai_1.expect(response.reprompt).to.deep.equal("<speak>this is a reprompt</speak>");
            chai_1.expect(response.hasTerminated).to.be.false;
        }));
        it("should ask and directives and reprmpt", () => __awaiter(this, void 0, void 0, function* () {
            const transition = {};
            yield new directives_1.Reply("Reply.Combined").writeToReply(response, event, transition);
            chai_1.expect(response.speech).to.deep.equal("<speak>this is an ask</speak>");
            chai_1.expect(response.reprompt).to.deep.equal("<speak>this is a reprompt</speak>");
            chai_1.expect(transition.directives).to.have.lengthOf(1);
            chai_1.expect(transition.directives[0]).to.be.an.instanceof(directives_2.Hint);
            chai_1.expect(response.hasTerminated).to.be.false;
        }));
    });
    describe("tell", () => {
        it("should end the session", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Tell("Question.Ask.ask").writeToReply(response, event, {});
            chai_1.expect(response.speech).to.deep.equal("<speak>What time is it?</speak>");
            chai_1.expect(response.hasTerminated).to.be.true;
        }));
    });
    describe("ask", () => {
        it("should render ask statements", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Ask("Question.Ask.ask").writeToReply(response, event, {});
            chai_1.expect(response.speech).to.deep.equal("<speak>What time is it?</speak>");
        }));
        it("should not terminate the session", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Ask("Question.Ask.ask").writeToReply(response, event, {});
            chai_1.expect(response.hasTerminated).to.be.false;
        }));
    });
    describe("say", () => {
        it("should render ask statements", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Say("Question.Ask.ask").writeToReply(response, event, {});
            chai_1.expect(response.speech).to.deep.equal("<speak>What time is it?</speak>");
        }));
        it("should not terminate the session", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Say("Question.Ask.ask").writeToReply(response, event, {});
            chai_1.expect(response.hasTerminated).to.be.false;
        }));
    });
    describe("reprompt", () => {
        it("should render reprompt statements", () => __awaiter(this, void 0, void 0, function* () {
            yield new directives_1.Reprompt("Question.Ask.ask").writeToReply(response, event, {});
            chai_1.expect(response.reprompt).to.equal("<speak>What time is it?</speak>");
        }));
    });
});
//# sourceMappingURL=directives.spec.js.map