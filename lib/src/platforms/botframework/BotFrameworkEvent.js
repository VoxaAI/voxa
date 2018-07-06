"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
const MicrosoftCortanaIntents = {
    "Microsoft.Launch": "LaunchIntent",
    "Microsoft.NoIntent": "NoIntent",
    "Microsoft.YesIntent": "YesIntent",
};
class BotFrameworkEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(message, context, stateData, storage, intent) {
        super(message, context);
        this.platform = "botframework";
        this.requestToRequest = {
            endOfConversation: "SessionEndedRequest",
        };
        this.utilitiesIntentMapping = {
            "Utilities.Cancel": "CancelIntent",
            "Utilities.Confirm": "YesIntent",
            // ther's no evident map of this ones so i just leave them as is
            // "Utilities.FinishTask": "",
            // "Utilities.GoBack": "",
            "Utilities.Help": "HelpIntent",
            "Utilities.Repeat": "RepeatIntent",
            "Utilities.ShowNext": "NextIntent",
            "Utilities.ShowPrevious": "PreviousIntent",
            "Utilities.StartOver": "StartOverIntent",
            "Utilities.Stop": "StopIntent",
        };
        this.session = {
            attributes: stateData.privateConversationData || {},
            new: _.isEmpty(stateData.privateConversationData),
            sessionId: _.get(message, "address.conversation.id"),
        };
        this.storage = storage;
        this.request = this.getRequest();
        this.mapRequestToRequest();
        if (intent) {
            this.request.type = "IntentRequest";
            this.intent = this.mapUtilitiesIntent(intent);
        }
        else {
            this.mapRequestToIntent();
            this.getIntentFromEntity();
        }
    }
    get supportedInterfaces() {
        return [];
    }
    getIntentFromEntity() {
        if (!isIMessage(this.rawEvent)) {
            return;
        }
        const intentEntity = _.find(this.rawEvent.entities, (e) => e.type === "Intent");
        if (!intentEntity) {
            return;
        }
        if (intentEntity.name === "None") {
            return;
        }
        this.request.type = "IntentRequest";
        this.intent = {
            name: MicrosoftCortanaIntents[intentEntity.name] || intentEntity.name,
            params: {},
            rawIntent: intentEntity,
        };
    }
    mapUtilitiesIntent(intent) {
        if (this.utilitiesIntentMapping[intent.name]) {
            intent.name = this.utilitiesIntentMapping[intent.name];
        }
        return intent;
    }
    get user() {
        return _.merge(this.rawEvent.address.user, { userId: this.rawEvent.address.user.id });
    }
    mapRequestToIntent() {
        if (isIConversationUpdate(this.rawEvent) && this.rawEvent.address.channelId === "webchat") {
            // in webchat we get a conversationUpdate event when the application window is open and another when the
            // user sends his first message, we want to identify that and only do a LaunchIntent for the first one
            const membersAdded = this.rawEvent.membersAdded;
            const bot = this.rawEvent.address.bot;
            if (membersAdded && bot && membersAdded.length === 1) {
                if (membersAdded[0].id === bot.id) {
                    _.set(this, "intent", {
                        name: "LaunchIntent",
                        slots: {},
                    });
                    _.set(this, "request.type", "IntentRequest");
                    return;
                }
            }
        }
        else {
            super.mapRequestToIntent();
        }
    }
    getRequest() {
        const type = this.rawEvent.type;
        let locale;
        if (isIMessage(this.rawEvent)) {
            if (this.rawEvent.textLocale) {
                locale = this.rawEvent.textLocale;
            }
            if (this.rawEvent.entities) {
                const entity = _(this.rawEvent.entities)
                    .filter((e) => e.type === "clientInfo")
                    .filter((e) => !!e.locale)
                    .first();
                if (entity) {
                    locale = entity.locale;
                }
            }
        }
        return { type, locale };
    }
}
exports.BotFrameworkEvent = BotFrameworkEvent;
function isIMessage(event) {
    return event.type === "message";
}
exports.isIMessage = isIMessage;
function isIConversationUpdate(event) {
    return event.type === "conversationUpdate";
}
exports.isIConversationUpdate = isIConversationUpdate;
//# sourceMappingURL=BotFrameworkEvent.js.map