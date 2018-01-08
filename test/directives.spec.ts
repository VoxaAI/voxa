import { expect, use } from "chai";
import chaiAsPromised = require("chai-as-promised");
import * as i18n from "i18next";
import "mocha";
import { AlexaEvent } from "../src/adapters/alexa/AlexaEvent";
import { AlexaReply } from "../src/adapters/alexa/AlexaReply";
import { ask, reply,  reprompt,  say, tell } from "../src/directives";
import { Renderer } from "../src/renderers/Renderer";
import { IVoxaEvent } from "../src/VoxaEvent";
import { AlexaRequestBuilder } from "./tools";
import * as views from "./views";

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
    const renderer = new Renderer({ views });
    event = new AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));

    event.t = i18n.getFixedT(event.request.locale);
    response = new AlexaReply(event, renderer);
  });

  describe("reply", () => {
    it("should render arrays", async () => {
      await reply(["Say.Say", "Question.Ask"])(response, event);
      expect(response.response.statements).to.deep.equal(["say", "What time is it?"]);
    });

    it("should fail to add after a yield arrays", () => {
      return expect(reply(["Question.Ask", "Question.Ask"])(response, event))
        .to.eventually.be.rejectedWith(Error, "Can't append to already yielding response");
    });
  });

  describe("tell", () => {
    it("should end the session", async () => {
      await tell("Question.Ask.ask")(response, event);
      expect(response.response.statements).to.deep.equal(["What time is it?"]);
      expect(response.response.terminate).to.be.true;
    });
  });

  describe("ask", () => {
    it("should render ask statements", async () => {
      await ask("Question.Ask.ask")(response, event);
      expect(response.response.statements).to.deep.equal(["What time is it?"]);
    });

    it("should not terminate the session", async () => {
      await ask("Question.Ask.ask")(response, event);
      expect(response.response.terminate).to.be.false;
    });

    it("should yield", async () => {
      await ask("Question.Ask.ask")(response, event);
      expect(response.isYielding()).to.be.true;
    });
  });

  describe("say", () => {
    it("should render ask statements", async () => {
      await say("Question.Ask.ask")(response, event);
      expect(response.response.statements).to.deep.equal(["What time is it?"]);
    });

    it("should not terminate the session", async () => {
      await say("Question.Ask.ask")(response, event);
      expect(response.response.terminate).to.be.false;
    });
  });

  describe("reprompt", () => {
    it("should render reprompt statements", async () => {
      await reprompt("Question.Ask.ask")(response, event);
      expect(response.response.reprompt).to.equal("What time is it?");
    });
  });
});
