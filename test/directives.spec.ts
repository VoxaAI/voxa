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

import { expect } from "chai";
import * as i18next from "i18next";
import "mocha";
import {
  AlexaEvent,
  AlexaPlatform,
  AlexaReply,
  Ask,
  IVoxaEvent,
  Renderer,
  Reprompt,
  Say,
  Tell,
  VoxaApp,
} from "../src";
import { AlexaRequestBuilder } from "./tools";
import { variables } from "./variables";
import { views } from "./views";

const i18n: i18next.i18n = require("i18next");

describe("directives", () => {
  let response: AlexaReply;
  let event: IVoxaEvent;
  let voxaApp: VoxaApp;

  before(async () => {
    await i18n.init({
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
    event.platform = new AlexaPlatform(voxaApp);
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

    it("should always use the first response if platform is configured as test", async () => {
      event.platform.config.test = true;
      await new Tell("TellRandom").writeToReply(response, event, {});
      expect("<speak>tell1</speak>").to.equal(response.speech);
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
