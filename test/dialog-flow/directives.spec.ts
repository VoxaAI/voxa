import { Carousel, List, MediaObject } from "actions-on-google";
import { expect } from "chai";
import * as i18n from "i18next";
import * as _ from "lodash";
import "mocha";

import { DialogFlowEvent } from "../../src/platforms/dialog-flow/DialogFlowEvent";
import { DialogFlowPlatform } from "../../src/platforms/dialog-flow/DialogFlowPlatform";
import { DialogFlowReply } from "../../src/platforms/dialog-flow/DialogFlowReply";
import { MediaResponse } from "../../src/platforms/dialog-flow/directives";
import { VoxaApp } from "../../src/VoxaApp";
import { variables } from "./../variables";
import { views } from "./../views";

describe("DialogFlow Directives", () => {
  let event: any;
  let app: VoxaApp;
  let dialogFlowAgent: DialogFlowPlatform;

  before(() => {
    i18n .init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    app =  new VoxaApp({ views, variables });
    dialogFlowAgent = new DialogFlowPlatform(app);
    event = require("../requests/dialog-flow/launchIntent.json");
  });

  describe("MediaResponse", () => {
    it("should add a MediaResponse", async () => {
      const mediaObject = new MediaObject({
        description: "Title",
        url: "https://example.com/example.mp3",
      });

      app.onIntent("LaunchIntent", {
        dialogFlowMediaResponse: mediaObject,
        sayp: "Hello!",
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});

      expect(reply.payload.google.richResponse).to.deep.equal({
      items: [
        {
          simpleResponse: {
            textToSpeech: "<speak>Hello!</speak>",
          },
        },
        {
          mediaResponse: {
            mediaObjects: [
              {
                contentUrl: "https://example.com/example.mp3",
                description: "Title",
                icon: undefined,
                largeImage: undefined,
                name: undefined,
              },
            ],
            mediaType: "AUDIO",
          },
        },
      ],
      });
    });

    it("should throw an error if trying to add a MediaResponse without a simpleResponse first", async () => {
      const reply = new DialogFlowReply();
      const dialogFlowEvent = new DialogFlowEvent(event, {});
      const mediaObject = new MediaObject({
        description: "Title",
        url: "https://example.com/example.mp3",
      });
      const mediaResponse = new MediaResponse(mediaObject);

      let error: Error|null = null;
      try {
        await mediaResponse.writeToReply(reply, dialogFlowEvent, {});
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an("Error");
      if (error == null) {
        throw expect(error).to.not.be.null;
      }
      expect(error.message).to.equal("MediaResponse requires another simple response first");
    });
  });

  describe("Carousel", () => {
    it("should add a carousel from a Responses.Carousel to the reply", async () => {

      const carousel = new Carousel({
        items: {
          LIST_ITEM: {
            description: "The item description",
            title: "the list item",
          },
        },
      });

      app.onIntent("LaunchIntent", {
        dialogFlowCarousel: carousel,
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
          "carouselSelect": {
            inputValueData: {
              "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
              "carouselSelect": {
                imageDisplayOptions: undefined,
                items: [
                  {
                    description: "The item description",
                    image: undefined,
                    optionInfo: {
                      key: "LIST_ITEM",
                      synonyms: undefined,
                    },
                    title: "the list item",
                  },
                ],
              },
            },
            intent: "actions.intent.OPTION",
          },
        },
        intent: "actions.intent.OPTION",
      });
    });
  });

  describe("List", () => {
    it("should add a List from a view to the reply", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowList: "DialogFlowListSelect",
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
          "listSelect": {
            items: [{
              description: "The item description",
              image: {
                accessibilityText: "The image",
                url: "http://example.com/image.jpg",
              },
              title: "The list item",
            }],
            title: "The list select",
          },
        },
        intent: "actions.intent.OPTION",
      });
    });

    it("should add a list from a Responses.List to the reply", async () => {
      const list = new List({
        items: {
          LIST_ITEM: {
            description: "The item description",
            image: {
              accessibilityText: "The image",
              url: "http://example.com/image.jpg",
            },
            title: "The list item",
          },
        },
        title: "The list select",
      });

      app.onIntent("LaunchIntent", {
        dialogFlowList: list,
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
          "listSelect": {
            inputValueData: {
              "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
              "listSelect": {
                items: [
                  {
                    description: "The item description",
                    image: {
                      accessibilityText: "The image",
                      url: "http://example.com/image.jpg",
                    },
                    optionInfo: {
                      key: "LIST_ITEM",
                      synonyms: undefined,
                    },
                    title: "The list item",
                  },
                ],
                title: "The list select",
              },
            },
            intent: "actions.intent.OPTION",
          },
        },
        intent: "actions.intent.OPTION",
      });
    });
  });
});
