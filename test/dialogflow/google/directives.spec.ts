import {
  Button,
  GoogleActionsTransactionsV3CompletePurchaseValueSpec,
  Image,
  MediaObject,
} from "actions-on-google";
import { DialogflowConversation } from "actions-on-google";
import { expect } from "chai";
import * as i18next from "i18next";
import * as _ from "lodash";
import "mocha";

import {
  DialogflowReply,
  GoogleAssistantEvent,
  GoogleAssistantPlatform,
  MediaResponse,
} from "../../../src/platforms/dialogflow";
import { VoxaApp } from "../../../src/VoxaApp";
import { variables } from "./../../variables";
import { views } from "./../../views";

const i18n: i18next.i18n = require("i18next");

describe("Google Assistant Directives", () => {
  let event: any;
  let app: VoxaApp;
  let dialogflowAgent: GoogleAssistantPlatform;

  before(async () => {
    await i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    dialogflowAgent = new GoogleAssistantPlatform(app);
    event = _.cloneDeep(require("../../requests/dialogflow/launchIntent.json"));
  });

  describe("Context", () => {
    it("should add an output context", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowContext: {
          lifespan: 5,
          name: "DONE_YES_NO_CONTEXT",
        },
        sayp: "Hello!",
        to: "die",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.outputContexts).to.deep.equal([
        {
          lifespanCount: 5,
          name:
            "projects/project/agent/sessions/1525973454075/contexts/DONE_YES_NO_CONTEXT",
          parameters: undefined,
        },
        {
          lifespanCount: 10000,
          name:
            "projects/project/agent/sessions/1525973454075/contexts/attributes",
          parameters: {
            attributes: '{"model":{},"state":"die"}',
          },
        },
      ]);
    });
  });

  describe("MediaResponse", () => {
    let mediaObject: MediaObject;
    beforeEach(() => {
      mediaObject = new MediaObject({
        description: "Title",
        url: "https://example.com/example.mp3",
      });
    });

    it("should not add a MediaResponse to a device with no audio support", async () => {
      event.originalDetectIntentRequest.payload.surface.capabilities = [];
      app.onIntent("LaunchIntent", {
        dialogflowMediaResponse: mediaObject,
        sayp: "Hello!",
        to: "die",
      });

      const reply = await dialogflowAgent.execute(event);

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
        dialogflowMediaResponse: mediaObject,
        sayp: "Hello!",
        to: "die",
      });

      const reply = await dialogflowAgent.execute(event);

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
      const reply = new DialogflowReply();
      const googleAssistantEvent = new GoogleAssistantEvent(event);
      const mediaResponse = new MediaResponse(mediaObject);

      let error: Error | null = null;
      try {
        await mediaResponse.writeToReply(reply, googleAssistantEvent, {});
      } catch (e) {
        error = e;
      }

      expect(error).to.be.an("error");
      if (error == null) {
        throw expect(error).to.not.be.null;
      }
      expect(error.message).to.equal(
        "A simple response is required before a dialogflowMediaResponse",
      );
    });
  });

  describe("Carousel", () => {
    it("should not add a carousel if the event has no SCREEN_OUTPUT", async () => {
      const carousel = {
        items: {
          LIST_ITEM: {
            description: "The item description",
            image: {
              url: "http://example.com/image.png",
            },
            synonyms: ["item"],
            title: "the list item",
          },
        },
      };

      app.onIntent("LaunchIntent", {
        dialogflowCarousel: carousel,
        to: "die",
      });

      event.originalDetectIntentRequest.payload.surface.capabilities = [];
      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.systemIntent).to.be.undefined;
    });

    it("should add a carousel from carouselOptions to the reply", async () => {
      const carousel = {
        items: {
          LIST_ITEM: {
            description: "The item description",
            image: {
              url: "http://example.com/image.png",
            },
            synonyms: ["item"],
            title: "the list item",
          },
        },
      };

      app.onIntent("LaunchIntent", {
        dialogflowCarousel: carousel,
        to: "die",
      });

      const reply = await dialogflowAgent.execute(event);
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
        dialogflowCarousel: "DialogflowCarousel",
        to: "die",
      });

      const reply = await dialogflowAgent.execute(event);
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
    it("should not add a List if event has no screen capabilites", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowList: "DialogflowListSelect",
        to: "die",
      });

      event.originalDetectIntentRequest.payload.surface.capabilities = [];
      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.systemIntent).to.be.undefined;
    });

    it("should add a List from a view to the reply", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowList: "DialogflowListSelect",
        to: "die",
      });

      const reply = await dialogflowAgent.execute(event);
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
                title: "The list item",
              },
            ],
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
        dialogflowList: list,
        to: "die",
      });

      const reply = await dialogflowAgent.execute(event);
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
        dialogflowDateTime: {
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

      const reply = await dialogflowAgent.execute(event);
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
        dialogflowConfirmation: "Confirmation",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type":
            "type.googleapis.com/google.actions.v2.ConfirmationValueSpec",
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
        dialogflowPlace: {
          context: "To get a your home address",
          prompt: "can i get your location?",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.PlaceValueSpec",
          "dialogSpec": {
            extension: {
              "@type":
                "type.googleapis.com/google.actions.v2.PlaceValueSpec.PlaceDialogSpec",
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
        dialogflowPermission: {
          context: "Can i get your name?",
          permissions: "NAME",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.PermissionValueSpec",
          "optContext": "Can i get your name?",
          "permissions": ["NAME"],
        },
        intent: "actions.intent.PERMISSION",
      });
    });
  });

  describe("DeepLinkDirective", () => {
    it("should add a DeepLink Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowDeepLink: {
          destination: "Google",
          package: "com.example.gizmos",
          reason: "handle this for you",
          url: "example://gizmos",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.LinkValueSpec",
          "dialogSpec": {
            extension: {
              "@type":
                "type.googleapis.com/google.actions.v2.LinkValueSpec.LinkDialogSpec",
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
    it("should not add BasicCard if missing screen output", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowBasicCard: "DialogflowBasicCard",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      event.originalDetectIntentRequest.payload.surface.capabilities = [];
      const reply = await dialogflowAgent.execute(event);
      expect(reply.hasDirective("BasicCard")).to.be.false;
    });

    it("should add a BasicCard from a view", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowBasicCard: "DialogflowBasicCard",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(
        _.get(reply, "payload.google.richResponse.items[1]"),
      ).to.deep.equal({
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
        dialogflowBasicCard: {
          buttons: {
            openUrlAction: "https://example.com",
            title: "Example.com",
          },
          display: "DEFAULT",
          image: {
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

      const reply = await dialogflowAgent.execute(event);
      expect(
        _.get(reply, "payload.google.richResponse.items[1]"),
      ).to.deep.equal({
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
    it("should add a Suggestions Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowSuggestions: ["suggestion"],
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(
        _.get(reply, "payload.google.richResponse.suggestions"),
      ).to.deep.equal([
        {
          title: "suggestion",
        },
      ]);
    });

    it("should add a Suggestions Response when using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "DialogflowSuggestions",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(
        _.get(reply, "payload.google.richResponse.suggestions"),
      ).to.deep.equal([
        {
          title: "Suggestion 1",
        },
        {
          title: "Suggestion 2",
        },
      ]);
    });
  });

  describe("Account Linking Directive", () => {
    it("should add a DeepLink Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowAccountLinkingCard: "AccountLinking",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.SignInValueSpec",
          "optContext": "Please Log in",
        },
        intent: "actions.intent.SIGN_IN",
      });
    });
  });

  describe("CompletePurchase Directive", () => {
    it("should add a CompletePurchase response", async () => {
      const googleCompletePurchaseOptions: GoogleActionsTransactionsV3CompletePurchaseValueSpec = {
        developerPayload: "developerPayload",
        skuId: {
          id: "subscription",
          packageName: "com.example",
          skuType: "SKU_TYPE_SUBSCRIPTION",
        },
      };

      app.onIntent("LaunchIntent", {
        flow: "yield",
        googleCompletePurchase: googleCompletePurchaseOptions,
        say: "DigitalGoods.BuyItem.say",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: _.merge(
          {
            "@type":
              "type.googleapis.com/google.actions.transactions.v3.CompletePurchaseValueSpec",
          },
          googleCompletePurchaseOptions,
        ),
        intent: "actions.intent.COMPLETE_PURCHASE",
      });
    });

    it("should add a CompletePurchase response with info in the reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "DigitalGoods.BuyItem",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: {
          "@type":
            "type.googleapis.com/google.actions.transactions.v3.CompletePurchaseValueSpec",
          "developerPayload": "developerPayload",
          "skuId": {
            id: "subscription",
            packageName: "com.example",
            skuType: "SKU_TYPE_SUBSCRIPTION",
          },
        },
        intent: "actions.intent.COMPLETE_PURCHASE",
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
        dialogflowTransactionDecision: transactionDecisionOptions,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: _.merge(
          {
            "@type":
              "type.googleapis.com/google.actions.v2.TransactionDecisionValueSpec",
          },
          transactionDecisionOptions,
        ),
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
        dialogflowTransactionRequirements: transactionRequirementsOptions,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: _.merge(
          {
            "@type":
              "type.googleapis.com/google.actions.v2.TransactionRequirementsCheckSpec",
          },
          transactionRequirementsOptions,
        ),
        intent: "actions.intent.TRANSACTION_REQUIREMENTS_CHECK",
      });
    });
  });

  describe("RegisterUpdate Directive", () => {
    it("should add a RegisterUpdate response", async () => {
      const registerUpdateOptions = {
        frequency: "ROUTINES",
        intent: "tell.tip",
      };

      app.onIntent("LaunchIntent", {
        dialogflowRegisterUpdate: registerUpdateOptions,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: {
          "@type":
            "type.googleapis.com/google.actions.v2.RegisterUpdateValueSpec",
          "arguments": undefined,
          "intent": "tell.tip",
          "triggerContext": {
            timeContext: {
              frequency: "ROUTINES",
            },
          },
        },
        intent: "actions.intent.REGISTER_UPDATE",
      });
    });
  });

  describe("UpdatePermission Directive", () => {
    it("should add an UpdatePermission response", async () => {
      const updatePermissionOptions = {
        arguments: [
          {
            name: "image_to_show",
            textValue: "image_type_1",
          },
        ],
        intent: "show.image",
      };

      app.onIntent("LaunchIntent", {
        dialogflowUpdatePermission: updatePermissionOptions,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.PermissionValueSpec",
          "optContext": undefined,
          "permissions": ["UPDATE"],
          "updatePermissionValueSpec": {
            arguments: [
              {
                name: "image_to_show",
                textValue: "image_type_1",
              },
            ],
            intent: "show.image",
          },
        },
        intent: "actions.intent.PERMISSION",
      });
    });
  });

  describe("Table Directive", () => {
    const table = {
      buttons: new Button({
        title: "Button Title",
        url: "https://github.com/actions-on-google",
      }),
      columns: [
        {
          align: "CENTER",
          header: "header 1",
        },
        {
          align: "LEADING",
          header: "header 2",
        },
        {
          align: "TRAILING",
          header: "header 3",
        },
      ],
      image: new Image({
        alt: "Actions on Google",
        url: "https://avatars0.githubusercontent.com/u/23533486",
      }),
      rows: [
        {
          cells: ["row 1 item 1", "row 1 item 2", "row 1 item 3"],
          dividerAfter: false,
        },
        {
          cells: ["row 2 item 1", "row 2 item 2", "row 2 item 3"],
          dividerAfter: true,
        },
        {
          cells: ["row 3 item 1", "row 3 item 2", "row 3 item 3"],
        },
      ],
      subtitle: "Table Subtitle",
      title: "Table Title",
    };

    it("should not add a Table Response if no screen output", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowTable: table,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      event.originalDetectIntentRequest.payload.surface.capabilities = [];
      const reply = await dialogflowAgent.execute(event);
      expect(reply.hasDirective("Table")).to.be.false;
    });

    it("should add a Table Response", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowTable: table,
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(
        _.get(reply, "payload.google.richResponse.items[1]"),
      ).to.deep.equal({
        tableCard: {
          buttons: [
            {
              openUrlAction: {
                url: "https://github.com/actions-on-google",
              },
              title: "Button Title",
            },
          ],
          columnProperties: [
            {
              header: "header 1",
              horizontalAlignment: "CENTER",
            },
            {
              header: "header 2",
              horizontalAlignment: "LEADING",
            },
            {
              header: "header 3",
              horizontalAlignment: "TRAILING",
            },
          ],
          image: {
            accessibilityText: "Actions on Google",
            height: undefined,
            url: "https://avatars0.githubusercontent.com/u/23533486",
            width: undefined,
          },
          rows: [
            {
              cells: [
                {
                  text: "row 1 item 1",
                },
                {
                  text: "row 1 item 2",
                },
                {
                  text: "row 1 item 3",
                },
              ],
              dividerAfter: false,
            },
            {
              cells: [
                {
                  text: "row 2 item 1",
                },
                {
                  text: "row 2 item 2",
                },
                {
                  text: "row 2 item 3",
                },
              ],
              dividerAfter: true,
            },
            {
              cells: [
                {
                  text: "row 3 item 1",
                },
                {
                  text: "row 3 item 2",
                },
                {
                  text: "row 3 item 3",
                },
              ],
              dividerAfter: undefined,
            },
          ],
          subtitle: "Table Subtitle",
          title: "Table Title",
        },
      });
    });
  });

  describe("NewSurface", () => {
    it("should include a new surface directive", async () => {
      const capability = "actions.capability.SCREEN_OUTPUT";
      app.onIntent("LaunchIntent", {
        dialogflowNewSurface: {
          capabilities: capability,
          context: "To show you an image",
          notification: "Check out this image",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.systemIntent).to.deep.equal({
        data: {
          "@type": "type.googleapis.com/google.actions.v2.NewSurfaceValueSpec",
          "capabilities": ["actions.capability.SCREEN_OUTPUT"],
          "context": "To show you an image",
          "notificationTitle": "Check out this image",
        },
        intent: "actions.intent.NEW_SURFACE",
      });
    });
  });

  describe("BrowseCarousel", () => {
    it("should not include a browse carouse if no screen output", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowBrowseCarousel: {},
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      event.originalDetectIntentRequest.payload.surface.capabilities = [];
      const reply = await dialogflowAgent.execute(event);
      expect(reply.hasDirective("BrowseCarousel")).to.be.false;
    });

    it("should include a new surface directive", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowBrowseCarousel: {},
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(
        _.get(reply, "payload.google.richResponse.items[1]"),
      ).to.deep.equal({
        carouselBrowse: {
          items: [{}],
        },
      });
    });
  });

  describe("LinkOutSuggestionDirective", () => {
    it("should add a LinkOutSuggestion", async () => {
      app.onIntent("LaunchIntent", {
        dialogflowLinkOutSuggestion: {
          name: "Example",
          url: "https://example.com",
        },
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.richResponse).to.deep.equal({
        items: [
          {
            simpleResponse: {
              textToSpeech: "<speak>Hello!</speak>",
            },
          },
        ],
        linkOutSuggestion: {
          destinationName: "Example",
          url: "https://example.com",
        },
      });
    });
  });

  describe("TextDirective", () => {
    it("should add a LinkOutSuggestion", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        sayp: "Say!",
        textp: "Text!",
        to: "entry",
      });

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.google.richResponse).to.deep.equal({
        items: [
          {
            simpleResponse: {
              displayText: "Text!",
              textToSpeech: "<speak>Say!</speak>",
            },
          },
        ],
      });
    });
  });
});
