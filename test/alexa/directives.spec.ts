import { expect, use } from "chai";
import chaiAsPromised = require("chai-as-promised");
import * as i18n from "i18next";
import "mocha";
import { AlexaAdapter } from "../../src/adapters/alexa/AlexaAdapter";
import { AlexaEvent } from "../../src/adapters/alexa/AlexaEvent";
import { AlexaReply } from "../../src/adapters/alexa/AlexaReply";
import { DisplayTemplate } from "../../src/adapters/alexa/DisplayTemplateBuilder";
import { Renderer } from "../../src/renderers/Renderer";
import { VoxaApp } from "../../src/VoxaApp";
import { IVoxaEvent } from "../../src/VoxaEvent";
import { Hint, HomeCard } from "./../../src/adapters/alexa/directives";
import { AlexaRequestBuilder } from "./../tools";
import * as variables from "./../variables";
import { views } from "./../views";

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

  describe("RenderTemplate", () => {
    it("should only add the template if request supports it", async () => {
      app.onIntent("YesIntent",  {
        RenderTemplate: "RenderTemplate",
        to: "die",
      });

      event.context.System.device.supportedInterfaces = {};
      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives).to.be.undefined;
    });

    it("should support adding a template directly", async () => {
      app.onIntent("YesIntent", () => {
        const template = new DisplayTemplate("BodyTemplate1");
        return {
          RenderTemplate: template,
        };
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives[0]).to.deep.equal({
        template: {
          backButton: "VISIBLE",
          type: "BodyTemplate1",
        },
        type: "Display.RenderTemplate",
      });
    });

    it("should add to the directives", async () => {
      app.onIntent("YesIntent", {
        RenderTemplate: "RenderTemplate",
        to: "die",
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives[0]).to.deep.equal({
        template: {
          backButton: "VISIBLE",
          backgroundImage: "Image",
          textContent: {
            primaryText: {
              text: "string",
              type: "string",
            },
            secondaryText: {
              text: "string",
              type: "string",
            },
            tertiaryText: {
              text: "string",
              type: "string",
            },
          },
          title: "string",
          token: "string",
          type: "BodyTemplate1",
        },
        type: "Display.RenderTemplate",
      });
    });
  });

  describe("Hint", () => {
    it("should only render a single Hint directive", async () => {
      app.onIntent("YesIntent", {
          Hint: "Hint",
          directives: [Hint("Hint")],
          to: "entry",
      });

      app.onError((request: AlexaEvent, error: Error) => {
        expect(error.message).to.equal("At most one Hint directive can be specified in a response");
      });

      const reply = await alexaSkill.execute(event, {});
      if (!reply.response.outputSpeech) {
        throw new Error("response missing");
      }

      expect(reply.response.outputSpeech.ssml).to.equal("<speak>An unrecoverable error occurred.</speak>");
    });

    it("should render a Hint directive", async () => {
      app.onIntent("YesIntent", {
        Hint: "Hint",
        to: "die",
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives).to.deep.equal([{
        hint: {
          text: "string",
          type: "PlainText",
        },
        type: "Hint",
      }]);
    });
  });

  describe("HomeCard", () => {
    it("should be usable from the directives", async () => {
      app.onIntent("YesIntent", {
        directives: [HomeCard("Card")],
        to: "die",
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
      app.onIntent("YesIntent", {
        HomeCard: "Card",
        to: "die",
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
      app.onIntent("YesIntent", {
        HomeCard: "Card",
        directives: [HomeCard("Card")],
        to: "entry",
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
