import { BasicCard, DateTime, RichResponse } from "actions-on-google";
import { expect } from "chai";
import * as _ from "lodash";
import { Model } from "../../src/Model";
import { DialogFlowEvent } from "../../src/platforms/dialogflow/DialogFlowEvent";
import { DialogFlowPlatform } from "../../src/platforms/dialogflow/DialogFlowPlatform";
import { DialogFlowReply } from "../../src/platforms/dialogflow/DialogFlowReply";
import { VoxaApp } from "../../src/VoxaApp";
import { views } from "../views";

/* tslint:disable-next-line:no-var-requires */
const rawEvent = require("../requests/dialogflow/launchIntent.json");

describe("DialogFlowReply", () => {
  let reply: DialogFlowReply;

  beforeEach(() => {
    reply = new DialogFlowReply();
  });

  describe("addStatement", () => {
    it("should add to both the speech and richResponse", () => {
      reply.addStatement("THIS IS A TEST");
      expect(reply.speech).to.equal("<speak>THIS IS A TEST</speak>");
      expect(
        _.get(reply, "payload.google.richResponse.items[0]"),
      ).to.deep.equal({
        simpleResponse: { textToSpeech: "<speak>THIS IS A TEST</speak>" },
      });
    });
  });

  describe("clear", () => {
    it("should empty the rich response, speech and reprompts", () => {
      reply.addStatement("THIS IS A TEST");
      reply.addReprompt("THIS IS A TEST REPROMPT");
      reply.clear();

      expect(reply.speech).to.equal("");
      expect(_.get(reply, "payload.google.richResponse")).to.be.undefined;
      expect(reply.payload.google.noInputPrompts).to.be.empty;
    });
  });
  describe("hasDirectives", () => {
    it("should return false when reply has no rich response or systemIntent", () => {
      expect(reply.hasDirectives).to.be.false;
    });

    it("should return true when reply has systemIntent", () => {
      const dateTime = new DateTime({});
      reply.payload.google.systemIntent = {
        data: dateTime.inputValueData,
        intent: dateTime.intent,
      };
      expect(reply.hasDirectives).to.be.true;
    });

    it("should return true when reply has a BasicCard", () => {
      const richResponse = new RichResponse();
      richResponse.add(new BasicCard({}));
      reply.payload.google.richResponse = richResponse;
      expect(reply.hasDirectives).to.be.true;
    });

    it("should return false when reply only has a plain text ", () => {
      reply.addStatement("text");
      expect(reply.hasDirectives).to.be.false;
    });
  });

  describe("hasDirective", () => {
    it("should return false when reply has no directives", () => {
      expect(reply.hasDirective("BasicCard")).to.be.false;
    });

    it("should return true when reply has a BasicCard and asks for a BasicCard", () => {
      const richResponse = new RichResponse();
      richResponse.add(new BasicCard({}));
      reply.payload.google.richResponse = richResponse;
      expect(reply.hasDirective("BasicCard")).to.be.true;
    });

    it("should return true when reply has a BasicCard and asks for a MediaResponse", () => {
      const richResponse = new RichResponse();
      richResponse.add(new BasicCard({}));
      reply.payload.google.richResponse = richResponse;
      expect(reply.hasDirective("MediaResponse")).to.be.false;
    });

    it("should return true when reply has a DateTime and asks for an actions.intent.DATETIME", () => {
      const dateTime = new DateTime({});
      reply.payload.google.systemIntent = {
        data: dateTime.inputValueData,
        intent: dateTime.intent,
      };
      expect(reply.hasDirective("actions.intent.DATETIME")).to.be.true;
    });
  });

  describe("hasMessages", () => {
    it("should return false when the reply has no statements", () => {
      expect(reply.hasMessages).to.be.false;
    });

    it("should return true when the reply has statements", () => {
      reply.addStatement("text");
      expect(reply.hasMessages).to.be.true;
    });
  });

  describe("hasTerminated", () => {
    it("should return false when the reply has not terminated", () => {
      expect(reply.hasTerminated).to.be.false;
    });

    it("should return true when the reply has terminated", () => {
      reply.terminate();
      expect(reply.hasTerminated).to.be.true;
    });
  });
});
