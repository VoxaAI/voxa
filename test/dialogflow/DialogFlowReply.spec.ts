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

import { BasicCard, RichResponse, SignIn } from "actions-on-google";
import { expect } from "chai";
import * as _ from "lodash";
import { DialogFlowReply } from "../../src/platforms/dialogflow";

/* tslint:disable-next-line:no-var-requires */
const rawEvent = require("../requests/dialogflow/launchIntent.json");
import { DialogflowConversation } from "actions-on-google";

describe("DialogFlowReply", () => {
  let reply: DialogFlowReply;

  beforeEach(() => {
    const conv = new DialogflowConversation({
      body: rawEvent,
      headers: {},
    });
    reply = new DialogFlowReply(conv);
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
