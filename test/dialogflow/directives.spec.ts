import { Button, Image, MediaObject } from "actions-on-google";
import { DialogflowConversation } from "actions-on-google";
import { expect } from "chai";
import * as i18n from "i18next";
import * as _ from "lodash";
import "mocha";

import {
  DialogflowEvent,
  DialogflowPlatform,
  DialogflowReply,
  FACEBOOK_IMAGE_ASPECT_RATIO,
  FACEBOOK_TOP_ELEMENT_STYLE,
  FACEBOOK_WEBVIEW_HEIGHT_RATIO,
  FacebookButtonTemplateBuilder,
  FacebookElementTemplateBuilder,
  FacebookQuickReplyText,
  FacebookTemplateBuilder,
  IFacebookGenericButtonTemplate,
  IFacebookPayloadTemplate,
  IFacebookQuickReply,
  MediaResponse,
} from "../../src/platforms/dialogflow";
import { VoxaApp } from "../../src/VoxaApp";
import { variables } from "./../variables";
import { views } from "./../views";

describe("Dialogflow Directives", () => {
  let event: any;
  let app: VoxaApp;
  let dialogflowAgent: DialogflowPlatform;

  before(() => {
    i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    dialogflowAgent = new DialogflowPlatform(app);
    event = _.cloneDeep(require("../requests/dialogflow/launchIntent.json"));
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
      const conv = new DialogflowConversation({
        body: event,
        headers: {},
      });
      const reply = new DialogflowReply(conv);
      const dialogflowEvent = new DialogflowEvent(event);
      const mediaResponse = new MediaResponse(mediaObject);

      let error: Error | null = null;
      try {
        await mediaResponse.writeToReply(reply, dialogflowEvent, {});
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

  describe("FacebookAccountLink", () => {
    it("should add a facebook account link button using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.AccountLink",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.fulfillmentText).to.equal("Text!");
      expect(reply.payload.facebook.attachment.payload).to.deep.equal({
        buttons: [
          {
            type: "account_link",
            url: "https://www.messenger.com",
          },
        ],
        template_type: "button",
        text: "Text!",
      });
    });

    it("should add a facebook account link button", async () => {
      app.onIntent("LaunchIntent", {
        facebookAccountLink: "https://www.messenger.com",
        flow: "yield",
        sayp: "Say!",
        textp: "Text!",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal({
        buttons: [
          {
            type: "account_link",
            url: "https://www.messenger.com",
          },
        ],
        template_type: "button",
        text: "Text!",
      });
    });
  });

  describe("FacebookAccountUnlink", () => {
    it("should add a facebook account unlink button using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.AccountUnlink",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.fulfillmentText).to.equal("Text!");
      expect(reply.payload.facebook.attachment.payload).to.deep.equal({
        buttons: [
          {
            type: "account_unlink",
          },
        ],
        template_type: "button",
        text: "Text!",
      });
    });

    it("should add a facebook account unlink button", async () => {
      app.onIntent("LaunchIntent", {
        facebookAccountUnlink: true,
        flow: "yield",
        sayp: "Say!",
        textp: "Text!",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal({
        buttons: [
          {
            type: "account_unlink",
          },
        ],
        template_type: "button",
        text: "Text!",
      });
    });
  });

  describe("FacebookSuggestionChips", () => {
    it("should add a FacebookSuggestionChips using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.Suggestions",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.fulfillmentText).to.equal("Pick a suggestion");
      expect(reply.payload.facebook.attachment.payload).to.deep.equal({
        buttons: [
          {
            payload: "Suggestion 1",
            title: "Suggestion 1",
            type: "postback",
          },
          {
            payload: "Suggestion 2",
            title: "Suggestion 2",
            type: "postback",
          },
        ],
        template_type: "button",
        text: "Pick a suggestion",
      });
    });

    it("should add a FacebookSuggestionChips", async () => {
      app.onIntent("LaunchIntent", {
        facebookSuggestionChips: ["yes", "no"],
        flow: "yield",
        sayp: "Say!",
        textp: "Text!",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal({
        buttons: [
          {
            payload: "yes",
            title: "yes",
            type: "postback",
          },
          {
            payload: "no",
            title: "no",
            type: "postback",
          },
        ],
        template_type: "button",
        text: "Text!",
      });
    });
  });

  describe("FacebookQuickReplyLocation", () => {
    it("should send a quick reply for location request using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.QuickReplyLocation",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.fulfillmentText).to.equal("Text!");
      expect(reply.payload.facebook.text).to.equal("Send me your location");
      expect(reply.payload.facebook.quick_replies).to.deep.equal([
        {
          content_type: "location",
        },
      ]);
    });

    it("should send a quick reply for location request", async () => {
      app.onIntent("LaunchIntent", {
        facebookQuickReplyLocation: "Send me your location",
        flow: "yield",
        sayp: "Say!",
        textp: "Text!",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.text).to.equal("Send me your location");
      expect(reply.payload.facebook.quick_replies).to.deep.equal([
        {
          content_type: "location",
        },
      ]);
    });
  });

  describe("FacebookQuickReplyPhoneNumber", () => {
    it("should send a quick reply for phone number request using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.QuickReplyPhoneNumber",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.fulfillmentText).to.equal("Text!");
      expect(reply.payload.facebook.text).to.equal("Send me your phone number");
      expect(reply.payload.facebook.quick_replies).to.deep.equal([
        {
          content_type: "user_phone_number",
        },
      ]);
    });

    it("should send a quick reply for phone number request", async () => {
      app.onIntent("LaunchIntent", {
        facebookQuickReplyPhoneNumber: "Send me your phone number",
        flow: "yield",
        sayp: "Say!",
        textp: "Text!",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.text).to.equal("Send me your phone number");
      expect(reply.payload.facebook.quick_replies).to.deep.equal([
        {
          content_type: "user_phone_number",
        },
      ]);
    });
  });

  describe("FacebookQuickReplyText", () => {
    it("should send a quick reply for options request from a single item", async () => {
      const quickReplyMessage = "What's your favorite shape?";
      const quickReplySingleElement: IFacebookQuickReply = {
        imageUrl: "https://www.example.com/imgs/imageExample.png",
        payload: "square",
        title: "Square Multicolor",
      };

      app.onIntent("LaunchIntent", (voxaEvent: DialogflowEvent) => {
        const facebookQuickReplyText = new FacebookQuickReplyText(quickReplyMessage, quickReplySingleElement);

        return {
          directives: [facebookQuickReplyText],
          flow: "yield",
          sayp: "Say!",
          textp: "Text!",
          to: "entry",
        };
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);

      const quickReplyExpect: any = _.cloneDeep(quickReplySingleElement);
      quickReplyExpect.image_url = quickReplySingleElement.imageUrl;
      quickReplyExpect.content_type = "text";

      _.unset(quickReplyExpect, "imageUrl");

      expect(reply.payload.facebook.text).to.equal(quickReplyMessage);
      expect(reply.payload.facebook.quick_replies).to.deep.equal([quickReplyExpect]);
    });

    it("should send a quick reply for options request from an array", async () => {
      const quickReplyTextArray: IFacebookQuickReply[] = [
        {
          imageUrl: "https://www.example.com/imgs/imageExample.png",
          payload: "square",
          title: "Square Multicolor",
        },
        {
          imageUrl: "https://www.w3schools.com/colors/img_colormap.gif",
          payload: "hexagonal",
          title: "Hexagonal multicolor",
        },
      ];

      app.onIntent("LaunchIntent", (voxaEvent: DialogflowEvent) => {
        const facebookQuickReplyText = new FacebookQuickReplyText("What's your favorite shape?", quickReplyTextArray);

        return {
          directives: [facebookQuickReplyText],
          flow: "yield",
          sayp: "Say!",
          textp: "Text!",
          to: "entry",
        };
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);

      const quickReplyExpect: any = _.cloneDeep(quickReplyTextArray);
      quickReplyExpect[0].image_url = quickReplyExpect[0].imageUrl;
      quickReplyExpect[1].image_url = quickReplyExpect[1].imageUrl;
      quickReplyExpect[0].content_type = "text";
      quickReplyExpect[1].content_type = "text";

      _.unset(quickReplyExpect[0], "imageUrl");
      _.unset(quickReplyExpect[1], "imageUrl");

      expect(reply.payload.facebook.text).to.equal("What's your favorite shape?");
      expect(reply.payload.facebook.quick_replies).to.deep.equal(quickReplyExpect);
    });
  });

  describe("FacebookQuickReplyUserEmail", () => {
    it("should send a quick reply for user's email request using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.QuickReplyUserEmail",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.fulfillmentText).to.equal("Text!");
      expect(reply.payload.facebook.text).to.equal("Send me your email");
      expect(reply.payload.facebook.quick_replies).to.deep.equal([
        {
          content_type: "user_email",
        },
      ]);
    });

    it("should send a quick reply for user's email request", async () => {
      app.onIntent("LaunchIntent", {
        facebookQuickReplyUserEmail: "Send me your email",
        flow: "yield",
        sayp: "Say!",
        textp: "Text!",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.text).to.equal("Send me your email");
      expect(reply.payload.facebook.quick_replies).to.deep.equal([
        {
          content_type: "user_email",
        },
      ]);
    });
  });

  describe("FacebookButtonTemplate", () => {
    it("should send a FacebookButtonTemplate using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.ButtonTemplate",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookButtonTemplatePayload = require("../requests/dialogflow/facebookButtonTemplatePayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookButtonTemplatePayload);
    });

    it("should send a FacebookButtonTemplate", async () => {
      app.onIntent("LaunchIntent", (voxaEvent: DialogflowEvent) => {
        const buttonBuilder1 = new FacebookButtonTemplateBuilder();
        const buttonBuilder2 = new FacebookButtonTemplateBuilder();
        const buttonBuilder3 = new FacebookButtonTemplateBuilder();
        const facebookTemplateBuilder = new FacebookTemplateBuilder();

        buttonBuilder1
          .setPayload("payload")
          .setTitle("View More")
          .setType("postback");

        buttonBuilder2
          .setPayload("1234567890")
          .setTitle("Call John")
          .setType("phone_number");

        buttonBuilder3
          .setTitle("Go to Twitter")
          .setType("web_url")
          .setUrl("http://www.twitter.com");

        facebookTemplateBuilder
          .addButton(buttonBuilder1.build())
          .addButton(buttonBuilder2.build())
          .addButton(buttonBuilder3.build())
          .setText("What do you want to do?");

        return {
          facebookButtonTemplate: facebookTemplateBuilder.build(),
          flow: "yield",
          sayp: "Say!",
          textp: "Text!",
          to: "entry",
        };
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookButtonTemplatePayload = require("../requests/dialogflow/facebookButtonTemplatePayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookButtonTemplatePayload);
    });
  });

  describe("FacebookCarousel", () => {
    it("should send a FacebookCarousel template using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.Carousel",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookCarouselPayload = require("../requests/dialogflow/facebookCarouselPayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookCarouselPayload);
    });

    it("should send a FacebookCarousel template", async () => {
      app.onIntent("LaunchIntent", (voxaEvent: DialogflowEvent) => {
        const buttonBuilder1 = new FacebookButtonTemplateBuilder();
        const buttonBuilder2 = new FacebookButtonTemplateBuilder();
        const elementBuilder1 = new FacebookElementTemplateBuilder();
        const elementBuilder2 = new FacebookElementTemplateBuilder();
        const facebookTemplateBuilder = new FacebookTemplateBuilder();

        buttonBuilder1
          .setTitle("Go to see this URL")
          .setType("web_url")
          .setUrl("https://www.example.com/imgs/imageExample.png");

        buttonBuilder2
          .setPayload("value")
          .setTitle("Send this to chat")
          .setType("postback");

        elementBuilder1
          .addButton(buttonBuilder1.build())
          .addButton(buttonBuilder2.build())
          .setDefaultActionUrl("https://www.example.com/imgs/imageExample.png")
          .setDefaultMessengerExtensions(false)
          .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.COMPACT)
          .setImageUrl("https://www.w3schools.com/colors/img_colormap.gif")
          .setSubtitle("subtitle")
          .setTitle("title");

        elementBuilder2
          .addButton(buttonBuilder1.build())
          .addButton(buttonBuilder2.build())
          .setDefaultActionUrl("https://www.example.com/imgs/imageExample.png")
          .setDefaultMessengerExtensions(false)
          .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
          .setImageUrl("https://www.w3schools.com/colors/img_colormap.gif")
          .setSubtitle("subtitle")
          .setTitle("title");

        facebookTemplateBuilder
          .addElement(elementBuilder1.build())
          .addElement(elementBuilder2.build())
          .setImageAspectRatio(FACEBOOK_IMAGE_ASPECT_RATIO.HORIZONTAL);

        return {
          facebookCarousel: facebookTemplateBuilder.build(),
          flow: "yield",
          sayp: "Say!",
          textp: "Text!",
          to: "entry",
        };
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookCarouselPayload = require("../requests/dialogflow/facebookCarouselPayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookCarouselPayload);
    });
  });

  describe("FacebookList", () => {
    it("should send a FacebookList template using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.List",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookListPayload = require("../requests/dialogflow/facebookListPayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookListPayload);
    });

    it("should send a FacebookList template", async () => {
      app.onIntent("LaunchIntent", (voxaEvent: DialogflowEvent) => {
        const buttonBuilder1 = new FacebookButtonTemplateBuilder();
        const buttonBuilder2 = new FacebookButtonTemplateBuilder();
        const elementBuilder1 = new FacebookElementTemplateBuilder();
        const elementBuilder2 = new FacebookElementTemplateBuilder();
        const elementBuilder3 = new FacebookElementTemplateBuilder();
        const facebookTemplateBuilder = new FacebookTemplateBuilder();

        buttonBuilder1
          .setPayload("payload")
          .setTitle("View More")
          .setType("postback");

        buttonBuilder2
          .setFallbackUrl("https://www.example.com")
          .setMessengerExtensions(false)
          .setTitle("View")
          .setType("web_url")
          .setUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
          .setWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.FULL);

        elementBuilder1
          .addButton(buttonBuilder2.build())
          .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
          .setSubtitle("See all our colors")
          .setTitle("Classic T-Shirt Collection")
          .setDefaultActionFallbackUrl("https://www.example.com");

        elementBuilder2
          .setDefaultActionUrl("https://www.w3schools.com")
          .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
          .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
          .setSubtitle("See all our colors")
          .setTitle("Classic T-Shirt Collection")
          .setSharable(false);

        buttonBuilder2.setWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL);

        elementBuilder3
          .addButton(buttonBuilder2.build())
          .setDefaultActionUrl("https://www.w3schools.com")
          .setDefaultWebviewHeightRatio(FACEBOOK_WEBVIEW_HEIGHT_RATIO.TALL)
          .setImageUrl("https://www.scottcountyiowa.com/sites/default/files/images/pages/IMG_6541-960x720_0.jpg")
          .setSubtitle("100% Cotton, 200% Comfortable")
          .setTitle("Classic T-Shirt Collection");

        facebookTemplateBuilder
          .addButton(buttonBuilder1.build())
          .addElement(elementBuilder1.build())
          .addElement(elementBuilder2.build())
          .addElement(elementBuilder3.build())
          .setSharable(true)
          .setTopElementStyle(FACEBOOK_TOP_ELEMENT_STYLE.LARGE);

        return {
          facebookList: facebookTemplateBuilder.build(),
          flow: "yield",
          sayp: "Say!",
          textp: "Text!",
          to: "entry",
        };
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookListPayload = require("../requests/dialogflow/facebookListPayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookListPayload);
    });
  });

  describe("FacebookOpenGraphTemplate", () => {
    it("should send a FacebookOpenGraphTemplate using a reply view", async () => {
      app.onIntent("LaunchIntent", {
        flow: "yield",
        reply: "Facebook.OpenGraphTemplate",
        to: "entry",
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookOpenGraphTemplatePayload = require("../requests/dialogflow/facebookOpenGraphTemplatePayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookOpenGraphTemplatePayload);
    });

    it("should send a FacebookOpenGraphTemplate", async () => {
      app.onIntent("LaunchIntent", (voxaEvent: DialogflowEvent) => {
        const elementBuilder1 = new FacebookElementTemplateBuilder();
        const buttonBuilder1 = new FacebookButtonTemplateBuilder();
        const buttonBuilder2 = new FacebookButtonTemplateBuilder();
        const facebookTemplateBuilder = new FacebookTemplateBuilder();

        buttonBuilder1
          .setTitle("Go to Wikipedia")
          .setType("web_url")
          .setUrl("https://en.wikipedia.org/wiki/Rickrolling");

        buttonBuilder2
          .setTitle("Go to Twitter")
          .setType("web_url")
          .setUrl("http://www.twitter.com");

        elementBuilder1
          .addButton(buttonBuilder1.build())
          .addButton(buttonBuilder2.build())
          .setUrl("https://open.spotify.com/track/7GhIk7Il098yCjg4BQjzvb");

        facebookTemplateBuilder
          .addElement(elementBuilder1.build());

        return {
          facebookOpenGraphTemplate: facebookTemplateBuilder.build(),
          flow: "yield",
          sayp: "Say!",
          textp: "Text!",
          to: "entry",
        };
      });

      event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));

      const facebookOpenGraphTemplatePayload = require("../requests/dialogflow/facebookOpenGraphTemplatePayload.json");

      const reply = await dialogflowAgent.execute(event);
      expect(reply.payload.facebook.attachment.payload).to.deep.equal(facebookOpenGraphTemplatePayload);
    });
  });
});
