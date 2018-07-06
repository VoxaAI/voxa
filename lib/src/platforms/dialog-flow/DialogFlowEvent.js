"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const actions_on_google_1 = require("actions-on-google");
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
const DialogFlowIntent_1 = require("./DialogFlowIntent");
const DialogFlowSession_1 = require("./DialogFlowSession");
class DialogFlowEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(event, context) {
        super(event, context);
        this.conv = new actions_on_google_1.DialogflowConversation({
            body: event,
            headers: {},
        });
        this.request = {
            locale: _.get(event.queryResult, "languageCode"),
            type: "IntentRequest",
        };
        this.session = new DialogFlowSession_1.DialogFlowSession(this.conv);
        this.intent = new DialogFlowIntent_1.DialogFlowIntent(this.conv);
        this.platform = "dialogFlow";
    }
    get user() {
        const response = {
            accessToken: this.conv.user.access.token,
            userId: this.conv.user.id,
        };
        return _.merge({}, this.conv.user, response);
    }
    get supportedInterfaces() {
        let capabilities = _.map(this.conv.surface.capabilities.list, "name");
        capabilities = _.filter(capabilities);
        return capabilities;
    }
}
exports.DialogFlowEvent = DialogFlowEvent;
//# sourceMappingURL=DialogFlowEvent.js.map