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
const directives_1 = require("../../src/directives");
const AlexaEvent_1 = require("../../src/platforms/alexa/AlexaEvent");
const AlexaReply_1 = require("../../src/platforms/alexa/AlexaReply");
const directives_2 = require("../../src/platforms/alexa/directives");
const Renderer_1 = require("../../src/renderers/Renderer");
const tools_1 = require("../tools");
const variables_1 = require("../variables");
const views_1 = require("../views");
const rb = new tools_1.AlexaRequestBuilder();
describe("AlexaReply", () => {
    let reply;
    let event;
    let renderer;
    before(() => {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    beforeEach(() => {
        renderer = new Renderer_1.Renderer({ views: views_1.views, variables: variables_1.variables });
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("SomeIntent"));
        event.renderer = renderer;
        event.t = i18n.getFixedT(event.request.locale);
        reply = new AlexaReply_1.AlexaReply();
    });
    it("should generate a correct alexa response and reprompt that doesn't  end a session for an ask response", () => {
        reply.addStatement("ask");
        reply.addReprompt("reprompt");
        chai_1.expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
            response: {
                // card: undefined,
                outputSpeech: {
                    ssml: "<speak>ask</speak>",
                    type: "SSML",
                },
                reprompt: {
                    outputSpeech: {
                        ssml: "<speak>reprompt</speak>",
                        type: "SSML",
                    },
                },
                shouldEndSession: false,
            },
            // sessionAttributes: {},
            version: "1.0",
        });
    });
    it("should generate a correct alexa response that doesn't  end a session for an ask response", () => {
        reply.addStatement("ask");
        chai_1.expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
            response: {
                outputSpeech: {
                    ssml: "<speak>ask</speak>",
                    type: "SSML",
                },
                shouldEndSession: false,
            },
            version: "1.0",
        });
    });
    it("should generate a correct alexa response that ends a session for a tell response", () => {
        reply.addStatement("tell");
        reply.terminate();
        chai_1.expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
            response: {
                outputSpeech: {
                    ssml: "<speak>tell</speak>",
                    type: "SSML",
                },
                shouldEndSession: true,
            },
            version: "1.0",
        });
    });
    // it("should generate a correct alexa response that doesn't end a session for an ask response", async () => {
    // const askF = await askP("ask");
    // askF(reply, event);
    // expect(reply).to.deep.equal({
    // response: {
    // outputSpeech: {
    // ssml: "<speak>ask</speak>",
    // type: "SSML",
    // },
    // shouldEndSession: false,
    // },
    // version: "1.0",
    // });
    // });
    // it("should generate a correct alexa response that ends a session for a tell response", async () => {
    // const tellF = await tellP("tell");
    // tellF(reply, event);
    // expect(reply).to.deep.equal({
    // response: {
    // outputSpeech: {
    // ssml: "<speak>tell</speak>",
    // type: "SSML",
    // },
    // shouldEndSession: true,
    // },
    // version: "1.0",
    // });
    // });
    it("should generate a correct alexa response persisting session attributes", () => {
        reply = new AlexaReply_1.AlexaReply();
        reply.addStatement("tell");
        reply.terminate();
        reply.sessionAttributes = { model: { name: "name" } };
        chai_1.expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
            response: {
                outputSpeech: {
                    ssml: "<speak>tell</speak>",
                    type: "SSML",
                },
                shouldEndSession: true,
            },
            sessionAttributes: {
                model: {
                    name: "name",
                },
            },
            version: "1.0",
        });
    });
    it("should generate a correct alexa response with directives", () => __awaiter(this, void 0, void 0, function* () {
        yield new directives_1.Tell("ExitIntent.Farewell").writeToReply(reply, event, {});
        yield new directives_2.Hint("Hint").writeToReply(reply, event, {});
        chai_1.expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
            response: {
                directives: [
                    {
                        hint: {
                            text: "string",
                            type: "PlainText",
                        },
                        type: "Hint",
                    },
                ],
                outputSpeech: {
                    ssml: "<speak>Ok. For more info visit example.com site.</speak>",
                    type: "SSML",
                },
                shouldEndSession: true,
            },
            version: "1.0",
        });
    }));
});
//# sourceMappingURL=AlexaReply.spec.js.map