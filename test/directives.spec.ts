import { expect } from "chai";
import * as i18n from "i18next";
import "mocha";
import { Ask, Reprompt, Say, Tell } from "../src/directives";
import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../src/platforms/alexa/AlexaReply";
import { Renderer } from "../src/renderers/Renderer";
import { VoxaApp } from "../src/VoxaApp";
import { IVoxaEvent } from "../src/VoxaEvent";
import { AlexaRequestBuilder } from "./tools";
import { variables } from "./variables";
import { views } from "./views";

describe("directives", () => {
  let response: AlexaReply;
  let event: IVoxaEvent;
  let voxaApp: VoxaApp;

  before(() => {
    i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    voxaApp = new VoxaApp({
      views: {},
    });
    const rb = new AlexaRequestBuilder();
    const renderer = new Renderer({ views, variables });
    event = new AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));

    event.t = i18n.getFixedT(event.request.locale);
    event.renderer = renderer;
    response = new AlexaReply();
  });

  describe("tell", () => {
    it("should end the session", async () => {
      await new Tell("Tell").writeToReply(response, event, {});
      expect(response.speech).to.equal("<speak>tell</speak>");
      expect(response.hasTerminated).to.be.true;
    });
    it("should render a random tell from the list", async () => {
      await new Tell("TellRandom").writeToReply(response, event, {});
      expect([
        "<speak>tell1</speak>",
        "<speak>tell2</speak>",
        "<speak>tell3</speak>",
      ]).to.include(response.speech);
      expect(response.hasTerminated).to.be.true;
    });
  });

  describe("ask", () => {
    it("should render ask statements", async () => {
      await new Ask("Ask").writeToReply(response, event, {});
      expect(response.speech).to.deep.equal("<speak>What time is it?</speak>");
    });
    it("should render Random Ask statements", async () => {
      await new Ask("AskRandomObj").writeToReply(response, event, {});
      expect([
        "<speak>ask1</speak>",
        "<speak>ask2</speak>",
        "<speak>ask3</speak>",
      ]).to.include(response.speech);

      expect([
        "<speak>reprompt1</speak>",
        "<speak>reprompt2</speak>",
        "<speak>reprompt3</speak>",
      ]).to.include(response.reprompt);
    });

    it("should not terminate the session", async () => {
      await new Ask("Ask").writeToReply(response, event, {});
      expect(response.hasTerminated).to.be.false;
    });
  });

  describe("say", () => {
    it("should render ask statements", async () => {
      await new Say("Say").writeToReply(response, event, {});
      expect(response.speech).to.deep.equal("<speak>say</speak>");
    });

    it("should not terminate the session", async () => {
      await new Say("Say").writeToReply(response, event, {});
      expect(response.hasTerminated).to.be.false;
    });

    it("should render a random Say ", async () => {
      await new Say("SayRandom").writeToReply(response, event, {});
      expect([
        "<speak>say1</speak>",
        "<speak>say2</speak>",
        "<speak>say3</speak>",
      ]).to.include(response.speech);
    });
  });

  describe("reprompt", () => {
    it("should render reprompt statements", async () => {
      await new Reprompt("Reprompt").writeToReply(response, event, {});
      expect(response.reprompt).to.equal("<speak>reprompt</speak>");
    });
    it("should render random reprompt statements", async () => {
      await new Reprompt("RepromptRandom").writeToReply(response, event, {});
      expect([
        "<speak>reprompt1</speak>",
        "<speak>reprompt2</speak>",
        "<speak>reprompt3</speak>",
      ]).to.include(response.reprompt);
    });
  });
});
