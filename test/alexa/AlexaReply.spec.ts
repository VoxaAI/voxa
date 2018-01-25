"use strict";

import * as botBuilder from "botbuilder";
import { expect } from "chai";
import * as i18n from "i18next";
import * as _ from "lodash";
import { Ask, Reprompt, Tell } from "../../src/directives";
import { AlexaEvent } from "../../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../../src/platforms/alexa/AlexaReply";
import { Hint, HomeCard } from "../../src/platforms/alexa/directives";
import { Renderer } from "../../src/renderers/Renderer";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

const rb = new AlexaRequestBuilder();

describe("AlexaReply", () => {
  let reply: AlexaReply;
  let event: AlexaEvent;
  let renderer: Renderer;

  before(() => {
    i18n .init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    renderer = new Renderer({ views, variables });
    event = new AlexaEvent(rb.getIntentRequest("SomeIntent"));
    event.renderer = renderer;
    event.t = i18n.getFixedT(event.request.locale);
    reply = new AlexaReply();
  });

  it("should generate a correct alexa response and reprompt that doesn't  end a session for an ask response", () => {
    reply.addStatement("ask");
    reply.addReprompt("reprompt");

    expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
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
    expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
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
    expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
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
    const someIntentEvent = rb.getIntentRequest("SomeIntent");
    reply = new AlexaReply();
    reply.addStatement("tell");
    reply.terminate();
    reply.sessionAttributes = { model: { name: "name" } };

    expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
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

  it("should generate a correct alexa response with directives", async () => {
    await new Tell("ExitIntent.Farewell").writeToReply(reply, event, {});
    await new Hint("Hint").writeToReply(reply, event, {});

    expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
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
  });
});
