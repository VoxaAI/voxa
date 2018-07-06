"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class DialogFlowIntent {
    constructor(conv) {
        this.rawIntent = conv;
        this.name = conv.action;
        if (!this.name || this.name === "input.unknown") {
            this.name = conv.intent;
        }
        this.name = this.name.replace(/^AMAZON./, "");
        this.params = this.getParams();
    }
    getParams() {
        const args = this.rawIntent.arguments.parsed.input;
        const input = {};
        if (this.rawIntent.input.type) {
            input[this.rawIntent.input.type] = this.rawIntent.input.raw;
        }
        const parameters = this.rawIntent.parameters;
        return _.merge({}, args, input, parameters);
    }
}
exports.DialogFlowIntent = DialogFlowIntent;
//# sourceMappingURL=DialogFlowIntent.js.map