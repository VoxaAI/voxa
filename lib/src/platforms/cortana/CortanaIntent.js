"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
function isIConversationUpdate(event) {
    return event.type === "conversationUpdate";
}
exports.isIConversationUpdate = isIConversationUpdate;
function isIMessage(event) {
    return event.type === "message";
}
exports.isIMessage = isIMessage;
var CortanaIntent = /** @class */ (function () {
    function CortanaIntent(message) {
        this.rawIntent = message;
        var intentEntity = _.find(this.rawIntent.entities, { type: "Intent" });
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
    return CortanaIntent;
}());
exports.CortanaIntent = CortanaIntent;
//# sourceMappingURL=CortanaIntent.js.map