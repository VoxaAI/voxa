import { expect, use } from "chai";
import * as i18n from "i18next";
import "mocha";
import { Ask, Reply, Reprompt, Say, Tell } from "../src/directives";
import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../src/platforms/alexa/AlexaReply";
import { Hint } from "../src/platforms/alexa/directives";
import { Renderer } from "../src/renderers/Renderer";
import { IVoxaEvent } from "../src/VoxaEvent";
import { AlexaRequestBuilder } from "./tools";
import { variables } from "./variables";
import { views } from "./views";

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

  describe("reply", () => {
    it("should pick up the directive statements", async () => {
      const transition: any = {};
      await new Reply("Reply.Directives").writeToReply(response, event, transition);
      expect(transition.directives).to.have.lengthOf(1);
      expect(transition.directives[0]).to.be.an.instanceof(Hint);
      expect(response.hasTerminated).to.be.false;
    });

    it("should pick up the tell statements", async () => {
      await new Reply("Reply.Tell").writeToReply(response, event, {});
      expect(response.speech).to.deep.equal("<speak>this is a tell</speak>");
      expect(response.hasTerminated).to.be.true;
    });

    it("should pick up the ask statements", async () => {
      await new Reply("Reply.Ask").writeToReply(response, event, {});
      expect(response.speech).to.deep.equal("<speak>this is an ask</speak>");
      expect(response.reprompt).to.deep.equal("<speak>this is a reprompt</speak>");
      expect(response.hasTerminated).to.be.false;
    });

    it("should ask and directives and reprmpt", async () => {
      const transition: any = {};
      await new Reply("Reply.Combined").writeToReply(response, event, transition);
      expect(response.speech).to.deep.equal("<speak>this is an ask</speak>");
      expect(response.reprompt).to.deep.equal("<speak>this is a reprompt</speak>");
      expect(transition.directives).to.have.lengthOf(1);
      expect(transition.directives[0]).to.be.an.instanceof(Hint);
      expect(response.hasTerminated).to.be.false;
    });

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
