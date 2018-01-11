"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
const interfaces_1 = require("./interfaces");
class DialogFlowEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(event, context) {
        super(event, context);
        _.merge(this, {
            request: {
                locale: event.lang,
                type: "IntentRequest",
            },
            session: {},
        }, event);
        this.session = new DialogFlowSession(event);
        this.intent = new DialogFlowIntent(event);
        this.platform = "dialogFlow";
    }
    get user() {
        return _.get(this, "originalRequest.data.user");
    }
}
exports.DialogFlowEvent = DialogFlowEvent;
class DialogFlowSession {
    constructor(rawEvent) {
        this.contexts = rawEvent.result.contexts;
        this.new = false;
        this.attributes = this.getAttributes();
    }
    getAttributes() {
        if (!this.contexts) {
            return {};
        }
        const attributes = _(this.contexts)
            .map((context) => {
            const contextName = context.name;
            let contextParams;
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
    }
}
class DialogFlowIntent {
    constructor(rawEvent) {
        this.rawIntent = rawEvent;
        if (rawEvent.result.resolvedQuery === "actions_intent_OPTION") {
            this.name = "actions.intent.OPTION";
        }
        else {
            this.name = rawEvent.result.metadata.intentName;
        }
        this.params = this.getParams();
    }
    getParams() {
        if (this.rawIntent.resolvedQuery === "actions_intent_OPTION") {
            const input = _.find(this.rawIntent.originalRequest.data.inputs, (input) => input.intent == interfaces_1.StandardIntents.OPTION);
            if (!input) {
                return {};
            }
            const args = _(input.arguments)
                .map((argument) => [argument.name, argument.textValue])
                .fromPairs()
                .value();
            return args;
        }
        return this.rawIntent.result.parameters;
    }
}
//# sourceMappingURL=DialogFlowEvent.js.map