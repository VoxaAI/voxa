"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const actions_on_google_1 = require("actions-on-google");
const chai_1 = require("chai");
const i18n = require("i18next");
const _ = require("lodash");
require("mocha");
const DialogFlowEvent_1 = require("../../src/platforms/dialog-flow/DialogFlowEvent");
const DialogFlowPlatform_1 = require("../../src/platforms/dialog-flow/DialogFlowPlatform");
const DialogFlowReply_1 = require("../../src/platforms/dialog-flow/DialogFlowReply");
const directives_1 = require("../../src/platforms/dialog-flow/directives");
const VoxaApp_1 = require("../../src/VoxaApp");
const variables_1 = require("./../variables");
const views_1 = require("./../views");
describe("DialogFlow Directives", () => {
    let event;
    let app;
    let dialogFlowAgent;
    before(() => {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    beforeEach(() => {
        app = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables });
        dialogFlowAgent = new DialogFlowPlatform_1.DialogFlowPlatform(app);
        event = require("../requests/dialog-flow/launchIntent.json");
    });
    describe("MediaResponse", () => {
        let mediaObject;
        beforeEach(() => {
            mediaObject = new actions_on_google_1.MediaObject({
                description: "Title",
                url: "https://example.com/example.mp3",
            });
        });
        it("should not add a MediaResponse to a device with no audio support", () => __awaiter(this, void 0, void 0, function* () {
            event = _.cloneDeep(event);
            event.originalDetectIntentRequest.payload.surface.capabilities = [];
            app.onIntent("LaunchIntent", {
                dialogFlowMediaResponse: mediaObject,
                sayp: "Hello!",
                to: "die",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.richResponse).to.deep.equal({
                items: [
                    {
                        simpleResponse: {
                            textToSpeech: "<speak>Hello!</speak>",
                        },
                    },
                ],
            });
        }));
        it("should add a MediaResponse", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowMediaResponse: mediaObject,
                sayp: "Hello!",
                to: "die",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.richResponse).to.deep.equal({
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
        }));
        it("should throw an error if trying to add a MediaResponse without a simpleResponse first", () => __awaiter(this, void 0, void 0, function* () {
            const reply = new DialogFlowReply_1.DialogFlowReply();
            const dialogFlowEvent = new DialogFlowEvent_1.DialogFlowEvent(event, {});
            const mediaResponse = new directives_1.MediaResponse(mediaObject);
            let error = null;
            try {
                yield mediaResponse.writeToReply(reply, dialogFlowEvent, {});
            }
            catch (e) {
                error = e;
            }
            chai_1.expect(error).to.be.an("Error");
            if (error == null) {
                throw chai_1.expect(error).to.not.be.null;
            }
            chai_1.expect(error.message).to.equal("MediaResponse requires another simple response first");
        }));
    });
    describe("Carousel", () => {
        it("should add a carousel from carouselOptions to the reply", () => __awaiter(this, void 0, void 0, function* () {
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
                dialogFlowCarousel: carousel,
                to: "die",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
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
        }));
        it("should add a carousel from a view to the reply", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowCarousel: "DialogFlowCarousel",
                to: "die",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
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
        }));
    });
    describe("List", () => {
        it("should add a List from a view to the reply", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowList: "DialogFlowListSelect",
                to: "die",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
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
        }));
        it("should add a list from a Responses.List to the reply", () => __awaiter(this, void 0, void 0, function* () {
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
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
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
        }));
    });
    describe("DateTimeDirective", () => {
        it("should add a DateTime Response", () => __awaiter(this, void 0, void 0, function* () {
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
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
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
        }));
    });
    describe("ConfirmationDirective", () => {
        it("should add a Confirmation Response", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowConfirmation: "Is that true?",
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
                data: {
                    "@type": "type.googleapis.com/google.actions.v2.ConfirmationValueSpec",
                    "dialogSpec": {
                        requestConfirmationText: "Is that true?",
                    },
                },
                intent: "actions.intent.CONFIRMATION",
            });
        }));
    });
    describe("PlaceDirective", () => {
        it("should add a Place Response", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowPlace: {
                    context: "To get a your home address",
                    prompt: "can i get your location?",
                },
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
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
        }));
    });
    describe("PermissionsDirective", () => {
        it("should add a Permissions Response", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowPermission: {
                    context: "Can i get your name?",
                    permissions: "NAME",
                },
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
                data: {
                    "@type": "type.googleapis.com/google.actions.v2.PermissionValueSpec",
                    "optContext": "Can i get your name?",
                    "permissions": [
                        "NAME",
                    ],
                },
                intent: "actions.intent.PERMISSION",
            });
        }));
    });
    describe("DeepLinkDirective", () => {
        it("should add a DeepLink Response", () => __awaiter(this, void 0, void 0, function* () {
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
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
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
        }));
    });
    describe("BasicCard Directive", () => {
        it("should add a BasicCard from a view", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowBasicCard: "DialogFlowBasicCard",
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.richResponse.items[1]")).to.deep.equal({
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
        }));
        it("should add a BasicCard Response", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowBasicCard: {
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
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.richResponse.items[1]")).to.deep.equal({
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
        }));
    });
    describe("Suggestions Directive", () => {
        it("should add a DeepLink Response", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowSuggestions: "suggestion",
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.richResponse.suggestions")).to.deep.equal([
                {
                    title: "suggestion",
                },
            ]);
        }));
    });
    describe("Account Linking Directive", () => {
        it("should add a DeepLink Response", () => __awaiter(this, void 0, void 0, function* () {
            app.onIntent("LaunchIntent", {
                dialogFlowAccountLinkingCard: "To check your account balance",
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
                data: {
                    "@type": "type.googleapis.com/google.actions.v2.SignInValueSpec",
                    "optContext": "To check your account balance",
                },
                intent: "actions.intent.SIGN_IN",
            });
        }));
    });
    describe("TransactionDecision Directive", () => {
        it("should add a TransactionDecision response", () => __awaiter(this, void 0, void 0, function* () {
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
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
                data: _.merge({
                    "@type": "type.googleapis.com/google.actions.v2.TransactionDecisionValueSpec",
                }, transactionDecisionOptions),
                intent: "actions.intent.TRANSACTION_DECISION",
            });
        }));
    });
    describe("TransactionRequirements Directive", () => {
        it("should add a TransactionRequirements response", () => __awaiter(this, void 0, void 0, function* () {
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
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
                data: _.merge({
                    "@type": "type.googleapis.com/google.actions.v2.TransactionRequirementsCheckSpec",
                }, transactionRequirementsOptions),
                intent: "actions.intent.TRANSACTION_REQUIREMENTS_CHECK",
            });
        }));
    });
    describe("RegisterUpdate Directive", () => {
        it("should add a RegisterUpdate response", () => __awaiter(this, void 0, void 0, function* () {
            const registerUpdateOptions = {
                frequency: "ROUTINES",
                intent: "tell.tip",
            };
            app.onIntent("LaunchIntent", {
                dialogFlowRegisterUpdate: registerUpdateOptions,
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
                data: {
                    "@type": "type.googleapis.com/google.actions.v2.RegisterUpdateValueSpec",
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
        }));
    });
    describe("UpdatePermission Directive", () => {
        it("should add an UpdatePermission response", () => __awaiter(this, void 0, void 0, function* () {
            const updatePermissionOptions = {
                arguments: [{
                        name: "image_to_show",
                        textValue: "image_type_1",
                    }],
                intent: "show.image",
            };
            app.onIntent("LaunchIntent", {
                dialogFlowUpdatePermission: updatePermissionOptions,
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.systemIntent")).to.deep.equal({
                data: {
                    "@type": "type.googleapis.com/google.actions.v2.PermissionValueSpec",
                    "optContext": undefined,
                    "permissions": [
                        "UPDATE",
                    ],
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
        }));
    });
    describe("Table Directive", () => {
        it("should add a Table Response", () => __awaiter(this, void 0, void 0, function* () {
            const table = {
                buttons: new actions_on_google_1.Button({
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
                image: new actions_on_google_1.Image({
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
            app.onIntent("LaunchIntent", {
                dialogFlowTable: table,
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(_.get(reply, "payload.google.richResponse.items[1]")).to.deep.equal({
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
        }));
    });
    describe("NewSurface", () => {
        it("should include a new surface directive", () => __awaiter(this, void 0, void 0, function* () {
            const capability = "actions.capability.SCREEN_OUTPUT";
            app.onIntent("LaunchIntent", {
                dialogFlowNewSurface: {
                    capabilities: capability,
                    context: "To show you an image",
                    notification: "Check out this image",
                },
                flow: "yield",
                sayp: "Hello!",
                to: "entry",
            });
            const reply = yield dialogFlowAgent.execute(event, {});
            chai_1.expect(reply.payload.google.systemIntent).to.deep.equal({
                data: {
                    "@type": "type.googleapis.com/google.actions.v2.NewSurfaceValueSpec",
                    "capabilities": [
                        "actions.capability.SCREEN_OUTPUT",
                    ],
                    "context": "To show you an image",
                    "notificationTitle": "Check out this image",
                },
                intent: "actions.intent.NEW_SURFACE",
            });
        }));
    });
});
//# sourceMappingURL=directives.spec.js.map