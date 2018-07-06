"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const botbuilder_azure_1 = require("botbuilder-azure");
const chai_1 = require("chai");
const _ = require("lodash");
const simple = require("simple-mock");
const BotFrameworkEvent_1 = require("../../src/platforms/botframework/BotFrameworkEvent");
const BotFrameworkPlatform_1 = require("../../src/platforms/botframework/BotFrameworkPlatform");
const BotFrameworkReply_1 = require("../../src/platforms/botframework/BotFrameworkReply");
describe("BotFrameworkReply", () => {
    let reply;
    let event;
    let audioCard;
    afterEach(() => {
        simple.restore();
    });
    beforeEach(() => {
        audioCard = new botbuilder_1.AudioCard();
        const cardMedia = { url: "http://example.com/audio.mp3", profile: "" };
        audioCard.media([cardMedia]);
        const azureTableClient = new botbuilder_azure_1.AzureTableClient("", "", "");
        const storage = new botbuilder_azure_1.AzureBotStorage({ gzipData: false }, azureTableClient);
        const rawEvent = BotFrameworkPlatform_1.prepIncomingMessage(_.cloneDeep(require("../requests/botframework/conversationUpdate.json")));
        event = new BotFrameworkEvent_1.BotFrameworkEvent(rawEvent, {}, {}, storage);
        reply = new BotFrameworkReply_1.BotFrameworkReply(event);
        simple.mock(storage, "saveData")
            .callbackWith(null, {});
    });
    it("should correctly format the reply activity", () => {
        chai_1.expect(_.omit(JSON.parse(JSON.stringify(reply)), "timestamp")).to.deep.equal({
            channelId: "webchat",
            conversation: {
                id: "6b19caf39bee43fb88ca463872861646",
            },
            from: {
                id: "lizard_spock@FCG2xuskP1M",
            },
            inputHint: "ignoringInput",
            recipient: {
                id: "6b19caf39bee43fb88ca463872861646",
            },
            replyToId: "1Q7OeMYotn1",
            speak: "",
            text: "",
            textFormat: "plain",
            type: "message",
        });
    });
    it("should correctly add speech statements", () => {
        reply.addStatement("Some text");
        chai_1.expect(reply.speech).to.equal("<speak>Some text</speak>");
        chai_1.expect(reply.speak).to.equal("<speak>Some text</speak>");
        reply.addStatement("Some more text");
        chai_1.expect(reply.speech).to.equal("<speak>Some text\nSome more text</speak>");
        chai_1.expect(reply.speak).to.equal("<speak>Some text\nSome more text</speak>");
    });
    it("should remove all directives and speech statements", () => {
        reply.addStatement("Some text");
        reply.attachments = [audioCard.toAttachment()];
        reply.clear();
        chai_1.expect(_.omit(JSON.parse(JSON.stringify(reply)), "timestamp")).to.deep.equal({
            channelId: "webchat",
            conversation: {
                id: "6b19caf39bee43fb88ca463872861646",
            },
            from: {
                id: "lizard_spock@FCG2xuskP1M",
            },
            inputHint: "expectingInput",
            recipient: {
                id: "6b19caf39bee43fb88ca463872861646",
            },
            replyToId: "1Q7OeMYotn1",
            speak: "",
            text: "",
            textFormat: "plain",
            type: "message",
        });
    });
    it("should set inputHint to acceptingInput on terminate", () => {
        reply.terminate();
        chai_1.expect(reply.inputHint).to.equal("acceptingInput");
        chai_1.expect(reply.hasTerminated).to.be.true;
    });
    it("should set hasMessages to true after addStatement", () => {
        chai_1.expect(reply.hasMessages).to.be.false;
        reply.addStatement("some statement");
        chai_1.expect(reply.hasMessages).to.be.true;
    });
    it("should set hasDirectives to true after suggestedActions", () => {
        chai_1.expect(reply.hasDirectives).to.be.false;
        reply.suggestedActions = new botbuilder_1.SuggestedActions()
            .addAction({ type: "", value: "" })
            .toSuggestedActions()
            .actions;
        chai_1.expect(reply.hasDirectives).to.be.true;
    });
});
//# sourceMappingURL=BotFrameworkReply.spec.js.map