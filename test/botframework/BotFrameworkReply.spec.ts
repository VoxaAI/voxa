import { AudioCard, ICardMediaUrl, SuggestedActions } from "botbuilder";
import { LuisRecognizer } from "botbuilder";
import { AzureBotStorage, AzureTableClient } from "botbuilder-azure";
import { expect } from "chai";
import * as _ from "lodash";
import * as simple from "simple-mock";
import { BotFrameworkEvent } from "../../src/platforms/botframework/BotFrameworkEvent";
import { BotFrameworkPlatform } from "../../src/platforms/botframework/BotFrameworkPlatform";
import { prepIncomingMessage } from "../../src/platforms/botframework/BotFrameworkPlatform";
import { BotFrameworkReply } from "../../src/platforms/botframework/BotFrameworkReply";
import { VoxaPlatform } from "../../src/platforms/VoxaPlatform";
import { VoxaApp } from "../../src/VoxaApp";

describe("BotFrameworkReply", () => {
  let reply: BotFrameworkReply;
  let event: BotFrameworkEvent;
  let audioCard: AudioCard;

  afterEach(() => {
    simple.restore();
  });

  beforeEach(() => {
    audioCard = new AudioCard();
    const cardMedia: ICardMediaUrl = {
      profile: "",
      url: "http://example.com/audio.mp3",
    };
    audioCard.media([cardMedia]);

    const azureTableClient = new AzureTableClient("", "", "");
    const storage = new AzureBotStorage({ gzipData: false }, azureTableClient);

    const rawEvent = prepIncomingMessage(
      _.cloneDeep(require("../requests/botframework/conversationUpdate.json")),
    );
    event = new BotFrameworkEvent(rawEvent, {}, {}, storage);

    reply = new BotFrameworkReply(event);

    simple.mock(storage, "saveData").callbackWith(null, {});
  });

  it("should correctly format the reply activity", () => {
    expect(
      _.omit(JSON.parse(JSON.stringify(reply)), "timestamp"),
    ).to.deep.equal({
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
    expect(reply.speech).to.equal("<speak>Some text</speak>");
    expect(reply.speak).to.equal("<speak>Some text</speak>");

    reply.addStatement("Some more text");
    expect(reply.speech).to.equal("<speak>Some text\nSome more text</speak>");
    expect(reply.speak).to.equal("<speak>Some text\nSome more text</speak>");
  });

  it("should remove all directives and speech statements", () => {
    reply.addStatement("Some text");
    reply.attachments = [audioCard.toAttachment()];

    reply.clear();

    expect(
      _.omit(JSON.parse(JSON.stringify(reply)), "timestamp"),
    ).to.deep.equal({
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
    expect(reply.inputHint).to.equal("acceptingInput");
    expect(reply.hasTerminated).to.be.true;
  });

  it("should set hasMessages to true after addStatement", () => {
    expect(reply.hasMessages).to.be.false;
    reply.addStatement("some statement");

    expect(reply.hasMessages).to.be.true;
  });

  it("should set hasDirectives to true after suggestedActions", () => {
    expect(reply.hasDirectives).to.be.false;
    reply.suggestedActions = new SuggestedActions()
      .addAction({ type: "", value: "" })
      .toSuggestedActions().actions;

    expect(reply.hasDirectives).to.be.true;
  });
});
