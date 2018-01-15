"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var DialogFlowSession = /** @class */ (function () {
    function DialogFlowSession(rawEvent) {
        this.contexts = rawEvent.result.contexts;
        this.new = false;
        this.attributes = this.getAttributes();
    }
    DialogFlowSession.prototype.getAttributes = function () {
        if (!this.contexts) {
            return {};
        }
        var attributes = _(this.contexts)
            .map(function (context) {
            var contextName = context.name;
            var contextParams;
            if (context.parameters[contextName]) {
                contextParams = context.parameters[contextName];
            }
            else {
                contextParams = context.parameters;
            }
            return [contextName, contextParams];
        })
            .fromPairs()
            .value();
        return attributes;
    };
    return DialogFlowSession;
}());
exports.DialogFlowSession = DialogFlowSession;
//# sourceMappingURL=DialogFlowSession.js.map