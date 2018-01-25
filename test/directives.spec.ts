import { expect, use } from "chai";
import chaiAsPromised = require("chai-as-promised");
import * as i18n from "i18next";
import "mocha";
import { Ask, Reprompt, Say, Tell } from "../src/directives";
import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../src/platforms/alexa/AlexaReply";
import { Renderer } from "../src/renderers/Renderer";
import { IVoxaEvent } from "../src/VoxaEvent";
import { AlexaRequestBuilder } from "./tools";
import { variables } from "./variables";
import { views } from "./views";

use(chaiAsPromised);

describe("directives", () => {
  let response: AlexaReply;
  let event: IVoxaEvent;

  before(() => {
    i18n .init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    const renderer = new Renderer({ views, variables });
    event = new AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));

    event.t = i18n.getFixedT(event.request.locale);
    event.renderer = renderer;
    response = new AlexaReply();
  });

  describe("tell", () => {
    it("should end the session", async () => {
      await new Tell("Question.Ask.ask").writeToReply(response, event, {});
      expect(response.speech).to.deep.equal("<speak>What time is it?</speak>");
      expect(response.hasTerminated).to.be.true;
    });
  });

  describe("ask", () => {
    it("should render ask statements", async () => {
      await new Ask("Question.Ask.ask").writeToReply(response, event, {});
      expect(response.speech).to.deep.equal("<speak>What time is it?</speak>");
    });

    it("should not terminate the session", async () => {
      await new Ask("Question.Ask.ask").writeToReply(response, event, {});
      expect(response.hasTerminated).to.be.false;
    });
  });

  describe("say", () => {
    it("should render ask statements", async () => {
      await new Say("Question.Ask.ask").writeToReply(response, event, {});
      expect(response.speech).to.deep.equal("<speak>What time is it?</speak>");
    });

    it("should not terminate the session", async () => {
      await new Say("Question.Ask.ask").writeToReply(response, event, {});
      expect(response.hasTerminated).to.be.false;
    });
  });

  describe("reprompt", () => {
    it("should render reprompt statements", async () => {
      await new Reprompt("Question.Ask.ask").writeToReply(response, event, {});
      expect(response.reprompt).to.equal("<speak>What time is it?</speak>");
    });
  });
});
