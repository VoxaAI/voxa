import { expect } from "chai";
import * as i18next from "i18next";
import * as _ from "lodash";
import "mocha";

import {
  AlexaEvent,
  AlexaPlatform,
  APLTemplate,
  DisplayTemplate,
  HomeCard,
  IVoxaIntentEvent,
  VoxaApp,
} from "../../src/";
import { AlexaRequestBuilder } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const i18n: i18next.i18n = require("i18next");

describe("Alexa directives", () => {
  let dialogStateEvent: any;
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  before(async () => {
    await i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    app = new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);
    dialogStateEvent = rb.getIntentRequest("GreetingIntent", {
      hello_world: "Hello",
    });
    event = rb.getIntentRequest("AMAZON.YesIntent");
  });

  describe("RenderTemplate", () => {
    it("should only add the template if request supports it", async () => {
      app.onIntent("YesIntent", {
        alexaRenderTemplate: "RenderTemplate",
        to: "die",
      });

      event.context.System.device.supportedInterfaces = {};
      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.be.undefined;
    });

    it("should support adding a template directly", async () => {
      app.onIntent("YesIntent", () => {
        const template = new DisplayTemplate("BodyTemplate1");
        return {
          alexaRenderTemplate: template,
        };
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.not.be.undefined;
      expect(
        JSON.parse(JSON.stringify(reply.response.directives)),
      ).to.deep.equal([
        {
          template: {
            type: "BodyTemplate1",
          },
          type: "Display.RenderTemplate",
        },
      ]);
    });

    it("should add to the directives", async () => {
      app.onIntent("YesIntent", {
        alexaRenderTemplate: "RenderTemplate",
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.not.be.undefined;
      expect(reply.response.directives).to.deep.equal([
        {
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
        },
      ]);
    });

    it("should be the only directive if APL is not supported", async () => {
      app.onIntent("YesIntent", {
        alexaAPLTemplate: "APLTemplate",
        alexaRenderTemplate: "RenderTemplate",
        to: "die",
      });

      event.context.System.device.supportedInterfaces = { Display: {} };
      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.not.be.undefined;
      expect(reply.response.directives).to.deep.equal([
        {
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
        },
      ]);
    });
  });

  describe("APLRenderTemplate", () => {
    it("should only add the template if request supports it", async () => {
      app.onIntent("YesIntent", {
        alexaAPLTemplate: "APLTemplate",
        to: "die",
      });

      event.context.System.device.supportedInterfaces = {};
      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.be.undefined;
    });

    it("should add to the directives", async () => {
      app.onIntent("YesIntent", {
        alexaAPLTemplate: "APLTemplate",
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.not.be.undefined;
      expect(reply.response.directives).to.deep.equal([
        {
          datasources: {},
          document: {},
          token: "SkillTemplateToken",
          type: "Alexa.Presentation.APL.RenderDocument",
        },
      ]);
    });

    it("should be in the directives array after the RenderTemplate", async () => {
      app.onIntent("YesIntent", {
        alexaAPLTemplate: "APLTemplate",
        alexaRenderTemplate: "RenderTemplate",
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.not.be.undefined;
      expect(reply.response.directives).to.deep.equal([
        {
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
        },
        {
          datasources: {},
          document: {},
          token: "SkillTemplateToken",
          type: "Alexa.Presentation.APL.RenderDocument",
        },
      ]);
    });
  });

  describe("APLCommand", () => {
    it("should only add the command if request supports it", async () => {
      app.onIntent("YesIntent", {
        alexaAPLCommand: "APLKaraokeCommand",
        to: "die",
      });

      event.context.System.device.supportedInterfaces = {};
      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.be.undefined;
    });

    it("should add to the directives", async () => {
      app.onIntent("YesIntent", {
        alexaAPLCommand: "APLKaraokeCommand",
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.not.be.undefined;
      expect(reply.response.directives).to.deep.equal([
        {
          commands: [
            {
              align: "center",
              componentId: "textComponent",
              highlightMode: "line",
              type: "SpeakItem",
            },
          ],
          token: "SkillTemplateToken",
          type: "Alexa.Presentation.APL.ExecuteCommands",
        },
      ]);
    });
  });

  describe("Hint", () => {
    it("should render a Hint directive", async () => {
      app.onIntent("YesIntent", {
        alexaHint: "Hint",
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          hint: {
            text: "string",
            type: "PlainText",
          },
          type: "Hint",
        },
      ]);
    });
  });

  describe("StopAudio", () => {
    it("should render an AudioPlayer.Stop directive", async () => {
      app.onIntent("YesIntent", {
        alexaStopAudio: undefined,
        to: "die",
      });
      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          type: "AudioPlayer.Stop",
        },
      ]);
    });
  });

  describe("AccountLinkingCard", () => {
    it("should render an AccountLinkingCard", async () => {
      app.onIntent("YesIntent", {
        alexaAccountLinkingCard: undefined,
        to: "die",
      });
      const reply = await alexaSkill.execute(event);
      expect(reply.response.card).to.deep.equal({
        type: "LinkAccount",
      });
    });
  });

  describe("HomeCard", () => {
    it("should be usable from the directives", async () => {
      app.onIntent("YesIntent", {
        directives: [new HomeCard("Card")],
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
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

      const reply = await alexaSkill.execute(event);
      expect(reply.response.card).to.deep.equal({
        image: {
          largeImageUrl: "https://example.com/large.jpg",
          smallImageUrl: "https://example.com/small.jpg",
        },
        title: "Title",
        type: "Standard",
      });
    });

    it("should render faile if variable doesn't return a card like object", async () => {
      app.onIntent("YesIntent", () => ({
        alexaCard: "Card2",
        to: "die",
      }));

      const reply = await alexaSkill.execute(event);
      expect(reply.response.card).to.be.undefined;
      expect(reply.speech).to.include("An unrecoverable error");
    });

    it("should not allow more than one card", async () => {
      app.onIntent("YesIntent", {
        alexaCard: "Card",
        directives: [new HomeCard("Card")],
        to: "entry",
      });

      app.onError((request: AlexaEvent, error: Error) => {
        expect(error.message).to.equal(
          "At most one card can be specified in a response",
        );
      });

      const reply = await alexaSkill.execute(event);
      if (!reply.response.outputSpeech) {
        throw new Error("response missing");
      }

      expect(reply.speech).to.equal(
        "<speak>An unrecoverable error occurred.</speak>",
      );
    });

    it("should accept a HomeCard object", async () => {
      app.onIntent("YesIntent", () => ({
        alexaCard: {
          image: {
            largeImageUrl: "https://example.com/large.jpg",
            smallImageUrl: "https://example.com/small.jpg",
          },
          title: "Title",
          type: "Standard",
        },
        flow: "yield",
        to: "entry",
      }));

      const reply = await alexaSkill.execute(event);

      expect(reply.response.card).to.deep.equal({
        image: {
          largeImageUrl: "https://example.com/large.jpg",
          smallImageUrl: "https://example.com/small.jpg",
        },
        title: "Title",
        type: "Standard",
      });
    });
  });

  describe("DialogDelegate", () => {
    it("should render a DialogDelegate directive with no slots", async () => {
      app.onIntent("YesIntent", {
        alexaDialogDelegate: undefined,
        to: "die",
      });
      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          type: "Dialog.Delegate",
        },
      ]);
    });

    it("should render a DialogDelegate directive with slot values", async () => {
      app.onIntent("GreetingIntent", (voxaEvent: IVoxaIntentEvent) => ({
        alexaDialogDelegate: voxaEvent.intent.params,
        to: "die",
      }));
      const reply = await alexaSkill.execute(dialogStateEvent);
      expect(reply.response.directives).to.deep.equal([
        {
          type: "Dialog.Delegate",
          updatedIntent: {
            confirmationStatus: "NONE",
            name: "GreetingIntent",
            slots: {
              hello_world: {
                confirmationStatus: "NONE",
                name: "hello_world",
                value: "Hello",
              },
            },
          },
        },
      ]);
    });
  });

  describe("DialogElicitSlot", () => {
    it("should render a DialogElicitSlot directive", async () => {
      app.onIntent("GreetingIntent", {
        alexaElicitDialog: {
          slotToElicit: "hello_world",
        },
      });
      const reply = await alexaSkill.execute(dialogStateEvent);
      expect(reply.response.directives).to.deep.equal([
        {
          slotToElicit: "hello_world",
          type: "Dialog.ElicitSlot",
          updatedIntent: {
            confirmationStatus: "NONE",
            name: "GreetingIntent",
            slots: {
              hello_world: {
                name: "hello_world",
                value: "Hello",
              },
            },
          },
        },
      ]);
    });

    it("should render a DialogElicitSlot directive with updated slot value", async () => {
      app.onIntent("GreetingIntent", {
        alexaElicitDialog: {
          slotToElicit: "hello_world",
          slots: {
            hello_world: {},
          },
        },
      });
      const reply = await alexaSkill.execute(dialogStateEvent);
      expect(reply.response.directives).to.deep.equal([
        {
          slotToElicit: "hello_world",
          type: "Dialog.ElicitSlot",
          updatedIntent: {
            confirmationStatus: "NONE",
            name: "GreetingIntent",
            slots: {
              hello_world: {
                name: "hello_world",
              },
            },
          },
        },
      ]);
    });

    it("DialogElicitSlot no slotToElicit error", async () => {
      app.onIntent("GreetingIntent", {
        alexaElicitDialog: {},
      });
      app.onError((request: AlexaEvent, error: Error) => {
        expect(error.message).to.equal(
          "slotToElicit is required for the Dialog.ElicitSlot directive",
        );
      });

      await alexaSkill.execute(dialogStateEvent);
    });

    it("DialogElicitSlot transition error", async () => {
      app.onIntent("GreetingIntent", {
        alexaElicitDialog: {
          slotToElicit: "hello_world",
        },
      });
      app.onError((request: AlexaEvent, error: Error) => {
        expect(error.message).to.equal(
          "You cannot transition to a new intent while using a Dialog.ElicitSlot directive",
        );
      });

      await alexaSkill.execute(dialogStateEvent);
    });
  });

  describe("DialogElicitSlot After Completion", () => {
    beforeEach(() => {
      _.set(dialogStateEvent, "dialogState", "COMPLETE");
    });

    it("DialogElicitSlot should return an error because dialog is complete", async () => {
      app.onIntent("GreetingIntent", {
        alexaElicitDialog: {
          slotToElicit: "hello_world",
        },
      });
      app.onError((request: AlexaEvent, error: Error) => {
        expect(error.message).to.equal(
          "Intent is missing dialogState or has already completed this dialog and cannot elicit any slots",
        );
      });

      await alexaSkill.execute(dialogStateEvent);
    });
  });

  describe("PlayAudio", () => {
    it("should render a PlayAudio directive", async () => {
      app.onIntent("YesIntent", {
        alexaPlayAudio: {
          behavior: "REPLACE_ENQUEUED",
          metadata: {
            art: {
              sources: [
                {
                  url: "url",
                },
              ],
            },
            backgroundImage: {
              sources: [
                {
                  url: "url",
                },
              ],
            },
            subtitle: "subtitle",
            title: "title",
          },
          offsetInMilliseconds: 0,
          token: "token",
          url: "url",
        },
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          audioItem: {
            metadata: {
              art: {
                sources: [
                  {
                    url: "url",
                  },
                ],
              },
              backgroundImage: {
                sources: [
                  {
                    url: "url",
                  },
                ],
              },
              subtitle: "subtitle",
              title: "title",
            },
            stream: {
              offsetInMilliseconds: 0,
              token: "token",
              url: "url",
            },
          },
          playBehavior: "REPLACE_ENQUEUED",
          type: "AudioPlayer.Play",
        },
      ]);
    });

    it("should render a PlayAudio directive with just the token and url", async () => {
      app.onIntent("YesIntent", {
        alexaPlayAudio: {
          token: "token",
          url: "url",
        },
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          audioItem: {
            metadata: {},
            stream: {
              offsetInMilliseconds: 0,
              token: "token",
              url: "url",
            },
          },
          playBehavior: "REPLACE_ALL",
          type: "AudioPlayer.Play",
        },
      ]);
    });

    it("should throw an error when trying to add both a video and audio directive", async () => {
      app.onIntent("YesIntent", () => {
        const response = {
          alexaPlayAudio: {
            token: "token",
            url: "url",
          },
          alexaVideoAppLaunch: {
            source: "source",
            subtitle: "subtitle",
            title: "title",
          },
          to: "die",
        };

        return response;
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.speech).to.include("An unrecoverable error");
    });
  });

  describe("VideoApp", () => {
    it("should render a VideApp.Launch directive", async () => {
      app.onIntent("YesIntent", {
        alexaVideoAppLaunch: "Reply.VideoAppLaunch.alexaVideoAppLaunch",
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          type: "VideoApp.Launch",
          videoItem: {
            metadata: {
              subtitle: "Video Subtitle",
              title: "Video Title",
            },
            source: "https://example.com/video.mp4",
          },
        },
      ]);
    });

    it("should render a VideoApp.Directive when sending a reply response", async () => {
      app.onIntent("YesIntent", {
        reply: "Reply.VideoAppLaunch",
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          type: "VideoApp.Launch",
          videoItem: {
            metadata: {
              subtitle: "Video Subtitle",
              title: "Video Title",
            },
            source: "https://example.com/video.mp4",
          },
        },
      ]);
    });

    it("should support setting the options directly from the controller", async () => {
      app.onIntent("YesIntent", {
        alexaVideoAppLaunch: {
          source: "https://example.com/video.mp4",
          subtitle: "Video Subtitle",
          title: "Video Title",
        },
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.response.directives).to.deep.equal([
        {
          type: "VideoApp.Launch",
          videoItem: {
            metadata: {
              subtitle: "Video Subtitle",
              title: "Video Title",
            },
            source: "https://example.com/video.mp4",
          },
        },
      ]);
    });

    it("should throw an error when trying to add both a video and audio directive", async () => {
      app.onIntent("YesIntent", {
        alexaPlayAudio: {
          token: "token",
          url: "url",
        },
        reply: ["Reply.VideoAppLaunch"],
        to: "die",
      });

      const reply = await alexaSkill.execute(event);
      expect(reply.speech).to.include("An unrecoverable error");
    });
  });
});
