"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var VoxaEvent_1 = require("../../VoxaEvent");
var interfaces_1 = require("./interfaces");
var DialogFlowEvent = /** @class */ (function (_super) {
    __extends(DialogFlowEvent, _super);
    function DialogFlowEvent(event, context) {
        var _this = _super.call(this, event, context) || this;
        _.merge(_this, {
            request: {
                locale: event.lang,
                type: "IntentRequest",
            },
            session: {},
        }, event);
        _this.session = new DialogFlowSession(event);
        _this.intent = new DialogFlowIntent(event);
        _this.platform = "dialogFlow";
        return _this;
    }
    Object.defineProperty(DialogFlowEvent.prototype, "user", {
        get: function () {
            return _.get(this, "originalRequest.data.user");
        },
        enumerable: true,
        configurable: true
    });
    return DialogFlowEvent;
}(VoxaEvent_1.IVoxaEvent));
exports.DialogFlowEvent = DialogFlowEvent;
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
//# sourceMappingURL=DialogFlowEvent.js.map