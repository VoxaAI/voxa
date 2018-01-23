import { expect, use } from "chai";
import chaiAsPromised = require("chai-as-promised");
import * as i18n from "i18next";
import "mocha";
import { AlexaAdapter } from "../../src/platforms/alexa/AlexaAdapter";
import { AlexaEvent } from "../../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../../src/platforms/alexa/AlexaReply";
import { DisplayTemplate } from "../../src/platforms/alexa/DisplayTemplateBuilder";
import { CortanaEvent } from "../../src/platforms/cortana/CortanaEvent";
import { Renderer } from "../../src/renderers/Renderer";
import { VoxaApp } from "../../src/VoxaApp";
import { IVoxaEvent } from "../../src/VoxaEvent";
import { variables } from "../variables";
import { hint, homeCard } from "./../../src/platforms/alexa/directives";
import { AlexaRequestBuilder } from "./../tools";
import { views } from "./../views";

// tslint:disable-next-line
const cortanaLaunch = require("../requests/cortana/microsoft.launch.json");

use(chaiAsPromised);

describe("Alexa directives", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaAdapter;
  let renderer: Renderer;

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
    renderer = new Renderer({ views, variables });
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
          alexaRenderTemplate: template,
        };
      });

      const reply = await alexaSkill.execute(event, {});
      expect(reply.response.directives).to.not.be.undefined;
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
    it("should not add to the reply if not an alexa event", async () => {
      const cortanaEvent = new CortanaEvent(cortanaLaunch, {}, {});
      const reply = new AlexaReply(cortanaEvent, renderer);

      await hint("Hint")(reply, event);
      expect(reply.response.directives).to.be.empty;
    });

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

  describe("HomeCard", () => {
    it("should be usable from the directives", async () => {
      app.onIntent("YesIntent", {
        directives: [homeCard("Card")],
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
        alexaHomeCard: "Card",
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
        alexaHomeCard: "Card",
        directives: [homeCard("Card")],
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
