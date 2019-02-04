/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  BasicCard,
  RichResponse,
  SignIn,
  Suggestions,
} from "actions-on-google";
import { expect } from "chai";
import * as _ from "lodash";
import { DialogflowReply, FacebookEvent, FacebookReply } from "../../src/platforms/dialogflow";

/* tslint:disable-next-line:no-var-requires */
const rawEvent = require("../requests/dialogflow/launchIntent.json");
import { DialogflowConversation } from "actions-on-google";

describe("FacebookReply", () => {
  let reply: FacebookReply;

  beforeEach(() => {
    reply = new FacebookReply(new FacebookEvent({
      queryResult: {
        intent: {
          displayName: "LaunchIntent",
        },
      },
    }));
  });

  describe("speech", () => {
    it("should return an empty string for a new reply", () => {
      expect(reply.speech).to.equal("");
    });

    it("should return an empty string for a reply without a simple response", () => {
      reply.payload.facebook.text = "";
      expect(reply.speech).to.equal("");
    });
  });

  describe("hasMessages", () => {
    it("should return false for a new reply", () => {
      expect(reply.hasMessages).to.be.false;
    });
  });

  describe("addStatement", () => {
    it("should add to both the speech and richResponse", () => {
      reply.addStatement("THIS IS A TEST", true);
      expect(reply.payload.facebook.text).to.equal("THIS IS A TEST");
      expect(reply.fulfillmentText).to.equal("THIS IS A TEST");
      expect(reply.speech).to.equal("THIS IS A TEST");
    });
  });

  describe("clear", () => {
    it("should empty the rich response, speech and reprompts", () => {
      reply.addStatement("THIS IS A TEST");
      reply.clear();

      expect(reply.payload.facebook.attachment).to.be.undefined;
      expect(reply.payload.facebook.quick_replies).to.be.undefined;
      expect(reply.payload.facebook.text).to.be.undefined;
      expect(reply.fulfillmentText).to.equal("");
      expect(reply.speech).to.be.empty;
    });
  });
});

describe("DialogflowReply", () => {
  let reply: DialogflowReply;

  beforeEach(() => {
    reply = new DialogflowReply();
  });

  describe("hasTerminated", () => {
    it("should return false for a new reply", () => {
      expect(reply.hasTerminated).to.be.false;
    });

    it("should return true after a call to reply.terminate", () => {
      reply.terminate();
      expect(reply.hasTerminated).to.be.true;
    });
  });

  describe("hasDirectives", () => {
    it("should return false for a new reply", () => {
      expect(reply.hasDirectives).to.be.false;
    });

    it("should return false for a reply with just a simple response", () => {
      reply.addStatement("Hello World");
      expect(reply.hasDirectives).to.be.false;
    });

    it("should return true for a reply with a card", () => {
      const card = new BasicCard({});
      const richResponse = new RichResponse();
      richResponse.add(card);
      reply.payload.google.richResponse = richResponse;
      expect(reply.hasDirectives).to.be.true;
    });

    it("should return true for a reply with an AccountLinkingCard", () => {
      const signIn = new SignIn();
      reply.payload.google.systemIntent = {
        data: signIn.inputValueData,
        intent: signIn.intent,
      };
      expect(reply.hasDirectives).to.be.true;
    });
  });

  describe("speech", () => {
    it("should return an empty string for a new reply", () => {
      expect(reply.speech).to.equal("");
    });

    it("should return an empty string for a reply without a simple response", () => {
      const suggestions = new Suggestions("suggestion");
      const richResponse = new RichResponse();
      richResponse.addSuggestion(suggestions);

      reply.payload.google.richResponse = richResponse;
      expect(reply.speech).to.equal("");
    });
  });

  describe("hasMessages", () => {
    it("should return false for a new reply", () => {
      expect(reply.hasMessages).to.be.false;
    });
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
      expect(reply.payload.google.richResponse).to.be.undefined;
      expect(reply.payload.google.noInputPrompts).to.be.empty;
    });
  });
});
