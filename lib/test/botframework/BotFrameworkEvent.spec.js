"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
Promise.resolve().then(() => require("mocha"));
const botbuilder_azure_1 = require("botbuilder-azure");
const chai_1 = require("chai");
const _ = require("lodash");
const BotFrameworkEvent_1 = require("../../src/platforms/botframework/BotFrameworkEvent");
const BotFrameworkPlatform_1 = require("../../src/platforms/botframework/BotFrameworkPlatform");
const azureTableClient = new botbuilder_azure_1.AzureTableClient("", "", "");
const storage = new botbuilder_azure_1.AzureBotStorage({ gzipData: false }, azureTableClient);
describe("BotFrameworkEvent", () => {
    it("should map a webchat conversationUpdate to a LaunchIntent", () => {
        const rawEvent = BotFrameworkPlatform_1.prepIncomingMessage(_.cloneDeep(require("../requests/botframework/conversationUpdate.json")));
        const event = new BotFrameworkEvent_1.BotFrameworkEvent(rawEvent, {}, {}, storage);
        chai_1.expect(event.request.type).to.equal("IntentRequest");
        if (!event.intent) {
            throw new Error("Intent should not be undefined");
        }
        chai_1.expect(event.intent.name).to.equal("LaunchIntent");
    });
    it("should map a Microsoft.Launch intent to a voxa LaunchIntent", () => {
        const rawEvent = _.cloneDeep(require("../requests/botframework/microsoft.launch.json"));
        const event = new BotFrameworkEvent_1.BotFrameworkEvent(rawEvent, {}, {}, storage);
        chai_1.expect(event.request.type).to.equal("IntentRequest");
        if (!event.intent) {
            throw new Error("Intent should not be undefined");
        }
        chai_1.expect(event.intent.name).to.equal("LaunchIntent");
    });
    it("should map an endOfConversation request to a voxa SessionEndedRequest", () => {
        const rawEvent = require("../requests/botframework/endOfRequest.json");
        const event = new BotFrameworkEvent_1.BotFrameworkEvent(rawEvent, {}, {}, storage);
        chai_1.expect(event.request.type).to.equal("SessionEndedRequest");
    });
    const utilitiesIntentMapping = {
        "Utilities.Cancel": "CancelIntent",
        "Utilities.Confirm": "YesIntent",
        "Utilities.Help": "HelpIntent",
        "Utilities.Repeat": "RepeatIntent",
        "Utilities.ShowNext": "NextIntent",
        "Utilities.ShowPrevious": "PreviousIntent",
        "Utilities.StartOver": "StartOverIntent",
        "Utilities.Stop": "StopIntent",
    };
    _.map(utilitiesIntentMapping, (to, from) => {
        it(`should map ${from} intento to ${to}`, () => {
            const rawEvent = _.cloneDeep(require("../requests/botframework/StaintIntent.json"));
            const intent = {
                name: from,
                params: {},
                rawIntent: {},
            };
            const event = new BotFrameworkEvent_1.BotFrameworkEvent(rawEvent, {}, {}, storage, intent);
            if (!event.intent) {
                throw new Error("Intent should not be undefined");
            }
            chai_1.expect(event.intent.name).to.equal(to);
        });
    });
    it("should correctly map the user", () => {
        const rawEvent = BotFrameworkPlatform_1.prepIncomingMessage(_.cloneDeep(require("../requests/botframework/StaintIntent.json")));
        const event = new BotFrameworkEvent_1.BotFrameworkEvent(rawEvent, {}, {}, storage);
        chai_1.expect(event.user).to.deep.equal({
            id: "LTSO852UtAD",
            name: "You",
            userId: "LTSO852UtAD",
        });
    });
});
//# sourceMappingURL=BotFrameworkEvent.spec.js.map