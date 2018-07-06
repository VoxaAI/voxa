"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class DialogFlowSession {
    constructor(conv) {
        this.contexts = conv.contexts.input;
        this.sessionId = conv.id;
        this.new = conv.type === "NEW";
        this.attributes = this.getAttributes(conv);
    }
    getAttributes(conv) {
        if (!this.contexts) {
            return {};
        }
        const context = this.contexts.model;
        if (!context) {
            return {};
        }
        if (_.isString(context.parameters.model)) {
            return JSON.parse(context.parameters.model);
        }
        if (_.isObject(context.parameters.model)) {
            return context.parameters.model;
        }
        return context.parameters.model;
    }
}
exports.DialogFlowSession = DialogFlowSession;
//# sourceMappingURL=DialogFlowSession.js.map