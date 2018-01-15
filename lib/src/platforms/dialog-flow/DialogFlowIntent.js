"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var interfaces_1 = require("./interfaces");
var DialogFlowIntent = /** @class */ (function () {
    function DialogFlowIntent(rawEvent) {
        this.rawIntent = rawEvent;
        if (rawEvent.result.resolvedQuery === "actions_intent_OPTION") {
            this.name = "actions.intent.OPTION";
        }
        else {
            this.name = rawEvent.result.metadata.intentName;
        }
        this.params = this.getParams();
    }
    DialogFlowIntent.prototype.getParams = function () {
        if (this.rawIntent.resolvedQuery === "actions_intent_OPTION") {
            var input = _.find(this.rawIntent.originalRequest.data.inputs, function (input) { return input.intent == interfaces_1.StandardIntents.OPTION; });
            if (!input) {
                return {};
            }
            var args = _(input.arguments)
                .map(function (argument) { return [argument.name, argument.textValue]; })
                .fromPairs()
                .value();
            return args;
        }
        return this.rawIntent.result.parameters;
    };
    return DialogFlowIntent;
}());
exports.DialogFlowIntent = DialogFlowIntent;
//# sourceMappingURL=DialogFlowIntent.js.map