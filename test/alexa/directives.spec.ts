import { expect, use } from "chai";
import * as i18n from "i18next";
import "mocha";
import { AlexaEvent } from "../../src/platforms/alexa/AlexaEvent";
import { AlexaPlatform } from "../../src/platforms/alexa/AlexaPlatform";
import { DisplayTemplate } from "../../src/platforms/alexa/DisplayTemplateBuilder";
import { VoxaApp } from "../../src/VoxaApp";
import { IVoxaEvent } from "../../src/VoxaEvent";
import { HomeCard } from "./../../src/platforms/alexa/directives";
import { AlexaRequestBuilder } from "./../tools";
import { views } from "./../views";

describe("Alexa directives", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  before(() => {
    i18n .init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    app =  new VoxaApp({ views });
    alexaSkill = new AlexaPlatform(app);
    event = rb.getIntentRequest("AMAZON.YesIntent");
  });

  describe("RenderTemplate", () => {
    it("should only add the template if request supports it", async () => {
      app.onIntent("YesIntent",  {
        alexaRenderTemplate: "RenderTemplate",
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
          alexaRenderTemplate: template,
        };
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives).to.not.be.undefined;
      expect(JSON.parse(JSON.stringify(reply.response.directives[0]))).to.deep.equal({
        template: {
          backButton: "VISIBLE",
          type: "BodyTemplate1",
        },
        type: "Display.RenderTemplate",
      });
    });

    it("should add to the directives", async () => {
      app.onIntent("YesIntent", {
        alexaRenderTemplate: "RenderTemplate",
        to: "die",
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives).to.not.be.undefined;
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
      const reply = await alexaSkill.execute(event, {});
      if (!reply.response.outputSpeech) {
        throw new Error("response missing");
      }

      expect(reply.response.outputSpeech.ssml).to.equal("<speak>An unrecoverable error occurred.</speak>");
    });

    it("should render a Hint directive", async () => {
      app.onIntent("YesIntent", {
        alexaHint: "Hint",
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

  describe("StopAudio", () => {
    it("should render an AudioPlayer.Stop directive", async () => {
      app.onIntent("YesIntent", {
        alexaStopAudio: undefined,
        to: "die",
      });
      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives).to.deep.equal([{
        type: "AudioPlayer.Stop",
      }]);
    });
  });

  describe("AccountLinkingCard", () => {
    it("should render an AccountLinkingCard", async () => {
      app.onIntent("YesIntent", {
        alexaAccountLinkingCard: undefined,
        to: "die",
      });
      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.card).to.deep.equal({
        type: "LinkAccount",
      });
    });
  });

  describe("DialogDelegate", () => {
    it("should render a DialogDelegate directive", async () => {
      app.onIntent("YesIntent", {
        alexaDialogDelegate: undefined,
        to: "die",
      });
      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives).to.deep.equal([{
        type: "Dialog.Delegate",
      }]);
    });
  });

  describe("HomeCard", () => {
    it("should be usable from the directives", async () => {
      app.onIntent("YesIntent", {
        directives: [new HomeCard("Card")],
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
        alexaCard: "Card",
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
        alexaCard: "Card",
        directives: [new HomeCard("Card")],
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
