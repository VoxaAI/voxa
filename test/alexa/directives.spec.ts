import { expect, use } from "chai";
import chaiAsPromised = require("chai-as-promised");
import * as i18n from "i18next";
import "mocha";
import { AlexaAdapter } from "../../src/adapters/alexa/AlexaAdapter";
import { AlexaEvent } from "../../src/adapters/alexa/AlexaEvent";
import { AlexaReply } from "../../src/adapters/alexa/AlexaReply";
import { Renderer } from "../../src/renderers/Renderer";
import { VoxaApp } from "../../src/VoxaApp";
import { IVoxaEvent } from "../../src/VoxaEvent";
import { HomeCard } from "./../../src/adapters/alexa/directives";
import { AlexaRequestBuilder } from "./../tools";
import * as variables from "./../variables.js";
import * as views from "./../views";

use(chaiAsPromised);

describe("Alexa directives", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaAdapter;

  before(() => {
    i18n .init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    event = rb.getIntentRequest("AMAZON.YesIntent");
    app =  new VoxaApp({ views });
    alexaSkill = new AlexaAdapter(app);
  });

  describe("HomeCard", () => {
    it("should be usable from the directives", async () => {
      app.onIntent("YesIntent", () => {
        return {
          directives: [HomeCard("Card")],
        };
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.card).to.deep.equal({
        image: {
          largeImageUrl: "https://example.com/large.jpg",
          smallImageUrl: "https://example.com/small.jpg",
        },
        title: "Title",
        type: "Standard",
      });
    });

    it("should render the home card", async () => {
      app.onIntent("YesIntent", () => {
        return { HomeCard: "Card" };
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.card).to.deep.equal({
        image: {
          largeImageUrl: "https://example.com/large.jpg",
          smallImageUrl: "https://example.com/small.jpg",
        },
        title: "Title",
        type: "Standard",
      });
    });

    it("should not allow more than one card", async () => {
      app.onIntent("YesIntent", () => {
        return {
          HomeCard: "Card",
          directives: [HomeCard("Card")],
        };
      });

      app.onError((request: AlexaEvent, error: Error) => {
        expect(error.message).to.equal("At most one card can be specified in a response");
      });

      const reply = await alexaSkill.execute(event, {});
      if (!reply.response.outputSpeech) {
        throw new Error("response missing");
      }

      expect(reply.response.outputSpeech.ssml).to.equal("<speak>An unrecoverable error occurred.</speak>");
    });
  });
});
