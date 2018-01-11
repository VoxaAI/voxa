"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
function isIConversationUpdate(event) {
    return event.type === "conversationUpdate";
}
exports.isIConversationUpdate = isIConversationUpdate;
function isIMessage(event) {
    return event.type === "message";
}
exports.isIMessage = isIMessage;
class CortanaIntent {
    constructor(message) {
        this.rawIntent = message;
        if (isIConversationUpdate(message) && message.membersAdded) {
            this.name = "LaunchIntent";
            this.params = message.membersAdded;
            return;
        }
        const intentEntity = _.find(this.rawIntent.entities, { type: "Intent" });
        if (!intentEntity) {
            this.name = "";
            this.params = {};
            return;
        }
        if (intentEntity.name === "Microsoft.Launch") {
            this.name = "LaunchIntent";
            this.params = {};
            return;
        }
        this.name = intentEntity.name || "";
        this.params = {};
    }
}
exports.CortanaIntent = CortanaIntent;
//# sourceMappingURL=CortanaIntent.js.map