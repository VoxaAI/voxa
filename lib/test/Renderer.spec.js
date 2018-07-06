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
require("mocha");
const chai_1 = require("chai");
const i18n = require("i18next");
const _ = require("lodash");
const Model_1 = require("../src/Model");
const Renderer_1 = require("../src/renderers/Renderer");
const VoxaApp_1 = require("../src/VoxaApp");
const variables_1 = require("./variables");
const views_1 = require("./views");
const AlexaEvent_1 = require("../src/platforms/alexa/AlexaEvent");
const AlexaReply_1 = require("../src/platforms/alexa/AlexaReply");
const directives_1 = require("../src/platforms/alexa/directives");
const DialogFlowEvent_1 = require("../src/platforms/dialog-flow/DialogFlowEvent");
const tools_1 = require("./tools");
const rb = new tools_1.AlexaRequestBuilder();
describe("Renderer", () => {
    let statesDefinition;
    let event;
    let renderer;
    before(() => {
        i18n
            .init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    beforeEach(() => {
        renderer = new Renderer_1.Renderer({ views: views_1.views, variables: variables_1.variables });
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("SomeIntent"));
        event.t = i18n.getFixedT("en-US");
        statesDefinition = {
            entry: () => ({ ask: "ExitIntent.Farewell", to: "die" }),
            initState: () => ({ to: "endState" }),
            secondState: () => ({ to: "initState" }),
            thirdState: () => Promise.resolve({ to: "endState" }),
        };
    });
    const locales = {
        "de-DE": {
            number: "ein",
            question: "wie spät ist es?",
            random: ["zufällig1", "zufällig2", "zufällig3", "zufällig4", "zufällig5"],
            say: "sagen\nwie spät ist es?",
            site: "Ok für weitere Infos besuchen example.com Website",
        },
        "en-US": {
            number: "one",
            question: "What time is it?",
            random: ["Random 1", "Random 2", "Random 3", "Random 4"],
            say: "say\nWhat time is it?",
            site: "Ok. For more info visit example.com site.",
        },
    };
    it("should return an error if the views file doesn't have the local strings", () => __awaiter(this, void 0, void 0, function* () {
        const localeMissing = "en-GB";
        const skill = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        skill.onIntent("SomeIntent", () => ({ ask: "Number.One" }));
        event.request.locale = localeMissing;
        const reply = yield skill.execute(event, new AlexaReply_1.AlexaReply());
        // expect(reply.error.message).to.equal(`View Number.One for ${localeMissing} locale is missing`);
        chai_1.expect(reply.speech).to.equal("<speak>An unrecoverable error occurred.</speak>");
    }));
    _.forEach(locales, (translations, locale) => {
        describe(locale, () => {
            let skill;
            beforeEach(() => {
                skill = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
            });
            it(`shold return a random response from the views array for ${locale}`, () => __awaiter(this, void 0, void 0, function* () {
                skill.onIntent("SomeIntent", () => ({ ask: "RandomResponse" }));
                event.request.locale = locale;
                const reply = yield skill.execute(event, new AlexaReply_1.AlexaReply());
                chai_1.expect(reply.speech).to.not.be.undefined;
                chai_1.expect(reply.speech).to.be.oneOf(_.map(translations.random, (tr) => `<speak>${tr}</speak>`));
            }));
            it(`should return the correct translation for ${locale}`, () => __awaiter(this, void 0, void 0, function* () {
                _.map(statesDefinition, (state, name) => skill.onState(name, state));
                event.request.locale = locale;
                const reply = yield skill.execute(event, new AlexaReply_1.AlexaReply());
                chai_1.expect(reply.speech).to.equal(`<speak>${translations.site}</speak>`);
                chai_1.expect(reply.response.directives).to.be.undefined;
            }));
            it(`work with array responses ${locale}`, () => __awaiter(this, void 0, void 0, function* () {
                skill.onIntent("SomeIntent", () => ({ say: "Say.Say", ask: "Question.Ask", to: "entry" }));
                event.request.locale = locale;
                const reply = yield skill.execute(event, new AlexaReply_1.AlexaReply());
                chai_1.expect(reply.speech).to.deep.equal(`<speak>${translations.say}</speak>`);
                chai_1.expect(reply.response.directives).to.be.undefined;
            }));
            it("should have the locale available in variables", () => __awaiter(this, void 0, void 0, function* () {
                skill.onIntent("SomeIntent", () => ({ tell: "Number.One" }));
                event.request.locale = locale;
                const reply = yield skill.execute(event, new AlexaReply_1.AlexaReply());
                chai_1.expect(reply.speech).to.equal(`<speak>${translations.number}</speak>`);
                chai_1.expect(reply.response.directives).to.be.undefined;
            }));
            it("should return response with directives", () => __awaiter(this, void 0, void 0, function* () {
                const playAudio = new directives_1.PlayAudio("url", "123", 0);
                skill.onIntent("SomeIntent", () => ({ ask: "Question.Ask", to: "entry", directives: [playAudio] }));
                event.request.locale = locale;
                const reply = yield skill.execute(event, new AlexaReply_1.AlexaReply());
                chai_1.expect(reply.speech).to.equal(`<speak>${translations.question}</speak>`);
                chai_1.expect(reply.response.directives).to.be.ok;
            }));
        });
    });
    it("should render the correct view based on path", () => __awaiter(this, void 0, void 0, function* () {
        const rendered = yield renderer.renderPath("Question.Ask", event);
        chai_1.expect(rendered).to.deep.equal({ ask: "What time is it?", reprompt: "What time is it?" });
    }));
    it("should use the passed variables and model", () => __awaiter(this, void 0, void 0, function* () {
        event.model = new Model_1.Model();
        event.model.count = 1;
        const rendered = yield renderer.renderMessage({ say: "{count}" }, event);
        chai_1.expect(rendered).to.deep.equal({ say: "1" });
    }));
    it("should fail for missing variables", (done) => {
        renderer.renderMessage({ say: "{missing}" }, event)
            .then(() => done("Should have failed"))
            .catch((error) => {
            chai_1.expect(error.message).to.equal("No such variable in views, missing");
            done();
        });
    });
    it("should throw an exception if path doesn't exists", (done) => {
        renderer.renderPath("Missing.Path", event).then(() => done("Should have thrown"), (error) => {
            chai_1.expect(error.message).to.equal("View Missing.Path for en-US locale is missing");
            done();
        });
    });
    it("should select a random option from the samples", () => __awaiter(this, void 0, void 0, function* () {
        const rendered = yield renderer.renderPath("RandomResponse", event);
        chai_1.expect(rendered).to.be.oneOf(["Random 1", "Random 2", "Random 3", "Random 4"]);
    }));
    it("should use deeply search to render object variable", () => __awaiter(this, void 0, void 0, function* () {
        event.model = new Model_1.Model();
        event.model.count = 1;
        const rendered = yield renderer.renderMessage({ card: "{exitCard}", number: 1 }, event);
        chai_1.expect(rendered).to.deep.equal({
            card: {
                image: {
                    largeImageUrl: "largeImage.jpg",
                    smallImageUrl: "smallImage.jpg",
                },
                text: "text",
                title: "title",
                type: "Standard",
            },
            number: 1,
        });
    }));
    it("should use deeply search variable and model in complex object structure", () => __awaiter(this, void 0, void 0, function* () {
        event.model = new Model_1.Model();
        event.model.count = 1;
        const rendered = yield renderer.renderMessage({
            card: { title: "{count}", text: "{count}", array: [{ a: "{count}" }] },
        }, event);
        chai_1.expect(rendered).to.deep.equal({
            card: {
                array: [{ a: "1" }],
                text: "1",
                title: "1",
            },
        });
    }));
    it("should use deeply search to render array variable", () => __awaiter(this, void 0, void 0, function* () {
        const reply = yield renderer.renderMessage({ card: "{exitArray}" }, event);
        chai_1.expect(reply).to.deep.equal({ card: [{ a: 1 }, { b: 2 }, { c: 3 }] });
    }));
    it("should use the dialogFlow view if available", () => __awaiter(this, void 0, void 0, function* () {
        const dialogFlowEvent = new DialogFlowEvent_1.DialogFlowEvent(require("./requests/dialog-flow/launchIntent.json"), {});
        dialogFlowEvent.t = event.t;
        const rendered = yield renderer.renderPath("LaunchIntent.OpenResponse", dialogFlowEvent);
        chai_1.expect(rendered).to.equal("Hello from DialogFlow");
    }));
});
//# sourceMappingURL=Renderer.spec.js.map