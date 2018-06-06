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
    let mediaObject: MediaObject;
    beforeEach(() => {
      mediaObject = new MediaObject({
        description: "Title",
        url: "https://example.com/example.mp3",
      });
    });

    it("should not add a MediaResponse to a device with no audio support",  async () => {
      event = _.cloneDeep(event);
      event.originalDetectIntentRequest.payload.surface.capabilities = {};
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
        ],
      });
    });

    it("should add a MediaResponse", async () => {
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
    it("should add a carousel from carouselOptions to the reply", async () => {

      const carousel = {
        items: {
          LIST_ITEM: {
            description: "The item description",
            title: "the list item",
            synonyms: ["item"],
            image: {
              url: "http://example.com/image.png",
            },
          },
        },
      };

      app.onIntent("LaunchIntent", {
        dialogFlowCarousel: carousel,
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
          "carouselSelect": {
            imageDisplayOptions: undefined,
            items: [
              {
                description: "The item description",
                image: {
                  url: "http://example.com/image.png",
                },
                optionInfo: {
                  key: "LIST_ITEM",
                  synonyms: ["item"],
                },
                title: "the list item",
              },
            ],
          },
        },
        intent: "actions.intent.OPTION",
      });
    });

    it("should add a carousel from a view to the reply", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowCarousel: "DialogFlowCarousel",
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
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
      const list = {
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
      };

      app.onIntent("LaunchIntent", {
        dialogFlowList: list,
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
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
      });
    });
  });

  describe("DateTimeDirective", () => {
    it("should add a DateTime Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowDateTime: {
          prompts: {
            date: "Which date works best for you?",
            initial: "When do you want to come in?",
            time: "What time of day works best for you?",
          },
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({

        data: {
          "@type": "type.googleapis.com/google.actions.v2.DateTimeValueSpec",
          "dialogSpec": {
            requestDateText: "Which date works best for you?",
            requestDatetimeText: "When do you want to come in?",
            requestTimeText: "What time of day works best for you?",
          },
        },
        intent: "actions.intent.DATETIME",
      });
    });
  });

  describe("ConfirmationDirective", () => {
    it("should add a Confirmation Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowConfirmation: "Is that true?",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.ConfirmationValueSpec",
          "dialogSpec": {
            requestConfirmationText: "Is that true?",
          },
        },
        intent: "actions.intent.CONFIRMATION",
      });
    });
  });

  describe("PlaceDirective", () => {
    it("should add a Place Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowPlace: {
          context: "To get a your home address",
          prompt: "can i get your location?",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.PlaceValueSpec",
          "dialogSpec": {
            extension: {
              "@type": "type.googleapis.com/google.actions.v2.PlaceValueSpec.PlaceDialogSpec",
              "permissionContext": "To get a your home address",
              "requestPrompt": "can i get your location?",
            },
          },
        },
        intent: "actions.intent.PLACE",
      });
    });
  });

  describe("PermissionsDirective", () => {
    it("should add a Permissions Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowPermission: {
          context: "Can i get your name?",
          permissions: "NAME",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.PermissionValueSpec",
          "optContext": "Can i get your name?",
          "permissions": [
            "NAME",
          ],
        },
        intent: "actions.intent.PERMISSION",
      });
    });
  });

  describe("DeepLinkDirective", () => {
    it("should add a DeepLink Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowDeepLink: {
          destination: "Google",
          package: "com.example.gizmos",
          reason: "handle this for you",
          url: "example://gizmos",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.LinkValueSpec",
          "dialogSpec": {
            extension: {
              "@type": "type.googleapis.com/google.actions.v2.LinkValueSpec.LinkDialogSpec",
              "destinationName": "Google",
              "requestLinkReason": "handle this for you",
            },
          },
          "openUrlAction": {
            androidApp: {
              packageName: "com.example.gizmos",
            },
            url: "example://gizmos",
          },
        },
        intent: "actions.intent.LINK",
      });
    });
  });

  describe("BasicCard Directive", () => {
    it("should add a BasicCard from a view", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowCard: "DialogFlowBasicCard",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(_.get(reply, "payload.google.richResponse.items[1]")).to.deep.equal({
        basicCard: {
          buttons: [
            {
              openUrlAction: "https://example.com",
              title: "Example.com",
            },
          ],
          formattedText: "This is the text",
          image: {
            url: "https://example.com/image.png",
          },
          imageDisplayOptions: "DEFAULT",
          subtitle: "subtitle",
          title: "title",
        },
      });
    });

    it("should add a BasicCard Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowCard: {
          buttons: {
            openUrlAction: "https://example.com",
            title: "Example.com",
          },
          display: "DEFAULT",
          image:  {
            url: "https://example.com/image.png",
          },
          subtitle: "subtitle",
          text: "This is the text",
          title: "title",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(_.get(reply, "payload.google.richResponse.items[1]")).to.deep.equal({
        basicCard: {
          buttons: [
            {
              openUrlAction: "https://example.com",
              title: "Example.com",
            },
          ],
          formattedText: "This is the text",
          image: {
            url: "https://example.com/image.png",
          },
          imageDisplayOptions: "DEFAULT",
          subtitle: "subtitle",
          title: "title",
        },
      });
    });
  });

  describe("Suggestions Directive", () => {
    it("should add a DeepLink Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowSuggestions: "suggestion",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(_.get(reply, "payload.google.richResponse.suggestions")).to.deep.equal([
        {
          title: "suggestion",
        },
      ]);
    });
  });

  describe("Account Linking Directive", () => {
    it("should add a DeepLink Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowAccountLinkingCard: "To check your account balance",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.SignInValueSpec",
          "optContext": "To check your account balance",
        },
        intent: "actions.intent.SIGN_IN",
      });
    });
  });

  describe("TransactionDecision Directive", () => {
    it("should add a TransactionDecision response", async () => {
      const order = require("./order.json");
      const transactionDecisionOptions = {
        orderOptions: {
          requestDeliveryAddress: false,
        },
        paymentOptions: {
          googleProvidedOptions: {
            prepaidCardDisallowed: false,
            supportedCardNetworks: ["VISA", "AMEX"],
            // These will be provided by payment processor,
            // like Stripe, Braintree, or Vantiv.
            tokenizationParameters: {
              "gateway": "stripe",
              "stripe:publishableKey": "pk_test_key",
              "stripe:version": "2017-04-06",
            },
          },
        },
        proposedOrder: order,
      };

      app.onIntent("LaunchIntent", {
        dialogFlowTransactionDecision: transactionDecisionOptions,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: _.merge({
          "@type": "type.googleapis.com/google.actions.v2.TransactionDecisionValueSpec",
        }, transactionDecisionOptions),
        intent: "actions.intent.TRANSACTION_DECISION",
      });
    });
  });

  describe("TransactionRequirements Directive", () => {
    it("should add a TransactionRequirements response", async () => {
      const transactionRequirementsOptions = {
        orderOptions: {
          requestDeliveryAddress: false,
        },
        paymentOptions: {
          googleProvidedOptions: {
            prepaidCardDisallowed: false,
            supportedCardNetworks: ["VISA", "AMEX"],
            // These will be provided by payment processor,
            // like Stripe, Braintree, or Vantiv.
            tokenizationParameters: {},
          },
        },
      };
      app.onIntent("LaunchIntent", {
        dialogFlowTransactionRequirements: transactionRequirementsOptions,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: _.merge({
          "@type": "type.googleapis.com/google.actions.v2.TransactionRequirementsCheckSpec",
        }, transactionRequirementsOptions),
        intent: "actions.intent.TRANSACTION_REQUIREMENTS_CHECK",
      });

    });
  });
});
