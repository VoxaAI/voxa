"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
const CortanaIntent_1 = require("./CortanaIntent");
class CortanaEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(message, context, stateData, intent) {
        super(message, context);
        this.type = "cortana";
        this.session = {
            attributes: stateData.privateConversationData || {},
            new: _.isEmpty(stateData.privateConversationData),
            sessionId: _.get(message, "address.conversation.id"),
        };
        this.context = {};
        if (intent) {
            this.intent = intent;
        }
        else {
            this.intent = new CortanaIntent_1.CortanaIntent(message);
        }
    }
    get user() {
        return _.merge(this.rawEvent.address.user, { userId: this.rawEvent.address.user.id });
    }
    get request() {
        let type = this.rawEvent.type;
        if (type === "endOfConversation") {
            type = "SessionEndedRequest";
        }
        if (this.intent && this.intent.name) {
            type = "IntentRequest";
        }
        let locale;
        if (this.rawEvent.textLocale) {
            locale = this.rawEvent.textLocale;
        }
        if (this.rawEvent.entities) {
            const entity = _(this.rawEvent.entities)
                .filter({ type: "clientInfo" })
                .filter((e) => !!e.locale)
                .first();
            if (entity) {
                locale = entity.locale;
            }
        }
        return { type, locale };
    }
}
exports.CortanaEvent = CortanaEvent;
function isIConversationUpdate(message) {
    return message.type === "conversationUpdate";
}
//# sourceMappingURL=CortanaEvent.js.map