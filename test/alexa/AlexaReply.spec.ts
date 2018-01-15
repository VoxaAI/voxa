"use strict";

import * as botBuilder from "botbuilder";
import { expect } from "chai";
import * as _ from "lodash";
import { askP, tellP } from "../../src/directives";
import { AlexaEvent } from "../../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../../src/platforms/alexa/AlexaReply";
import { Renderer } from "../../src/renderers/Renderer";
import { AlexaRequestBuilder } from "../tools";
import { views } from "../views";

const rb = new AlexaRequestBuilder();

describe("AlexaReply", () => {
  let reply: AlexaReply;
  let event: AlexaEvent;
  beforeEach(() => {
    event = new AlexaEvent(rb.getIntentRequest("SomeIntent"));
    reply = new AlexaReply(event, new Renderer({ views }));
  });

  describe("toJSON", () => {
    it("should generate a correct alexa response and reprompt that doesn't  end a session for an ask response", () => {
      reply.response.statements.push("ask");
      reply.response.reprompt = "reprompt";
      reply.response.terminate = false;
      reply.yield();

      expect(reply.toJSON()).to.deep.equal({
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
      reply.response.statements.push("ask");
      reply.response.terminate = false;
      expect(reply.toJSON()).to.deep.equal({
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
      reply.response.statements.push("tell");
      expect(reply.toJSON()).to.deep.equal({
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

    it("should generate a correct alexa response that doesn't end a session for an ask response", async () => {
      const askF = await askP("ask");
      askF(reply, event);
      expect(reply.toJSON()).to.deep.equal({
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

    it("should generate a correct alexa response that ends a session for a tell response", async () => {
      const tellF = await tellP("tell");
      tellF(reply, event);
      expect(reply.toJSON()).to.deep.equal({
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

    it("should generate a correct alexa response persisting session attributes", () => {
      const someIntentEvent = rb.getIntentRequest("SomeIntent");
      someIntentEvent.session.attributes = { model: { name: "name" } };
      reply = new AlexaReply(new AlexaEvent(someIntentEvent), new Renderer({ views }));
      reply.response.statements.push("tell");
      expect(reply.toJSON()).to.deep.equal({
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

    it("should generate a correct alexa response with directives", () => {
      reply.response.statements.push("tell");
      reply.response.directives.push({ type: "Hint", hint: { text: "hint", type: "PlainText" } });
      expect(reply.toJSON()).to.deep.equal({
        response: {
          directives: [
            {
              hint: {
                text: "hint",
                type: "PlainText",
              },
              type: "Hint",
            },
          ],
          outputSpeech: {
            ssml: "<speak>tell</speak>",
            type: "SSML",
          },
          shouldEndSession: true,
        },
        version: "1.0",
      });
    });
  });
});
