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
var CortanaEvent = /** @class */ (function (_super) {
    __extends(CortanaEvent, _super);
    function CortanaEvent(message, context, stateData, intent) {
        var _this = _super.call(this, message, context) || this;
        _this.requestToRequest = {
            endOfConversation: "SessionEndedRequest",
            message: "IntentRequest",
        };
        _this.platform = "cortana";
        _this.session = {
            attributes: stateData.privateConversationData || {},
            new: _.isEmpty(stateData.privateConversationData),
            sessionId: _.get(message, "address.conversation.id"),
        };
        _this.context = {};
        _this.request = _this.getRequest();
        _this.mapRequestToRequest();
        if (intent) {
            _this.intent = intent;
        }
        else {
            _this.mapRequestToIntent();
        }
        return _this;
    }
    Object.defineProperty(CortanaEvent.prototype, "user", {
        get: function () {
            return _.merge(this.rawEvent.address.user, { userId: this.rawEvent.address.user.id });
        },
        enumerable: true,
        configurable: true
    });
    CortanaEvent.prototype.mapRequestToIntent = function () {
        if (isIMessage(this.rawEvent)) {
            var entities = this.rawEvent.entities;
            var intentEntity = _.find(this.rawEvent.entities, { name: "Microsoft.Launch" });
            if (intentEntity) {
                _.set(this, "intent", {
                    name: "LaunchIntent",
                    slots: {},
                });
                _.set(this, "request.type", "IntentRequest");
                return;
            }
        }
        else if (isIConversationUpdate(this.rawEvent) && this.rawEvent.address.channelId === "webchat") {
            // in webchat we get a conversationUpdate event when the application window is open and another when the
            // user sends his first message, we want to identify that and only do a LaunchIntent for the first one
            var membersAdded = this.rawEvent.membersAdded;
            var bot = this.rawEvent.address.bot;
            if (membersAdded && bot && membersAdded.length === 1) {
                if (membersAdded[0].id === bot.id) {
                    _.set(this, "intent", {
                        name: "LaunchIntent",
                        slots: {},
                    });
                    _.set(this, "request.type", "IntentRequest");
                    return;
                }
            }
        }
        else {
            _super.prototype.mapRequestToIntent.call(this);
        }
    };
    CortanaEvent.prototype.getRequest = function () {
        var type = this.rawEvent.type;
        var locale;
        if (isIMessage(this.rawEvent)) {
            if (this.rawEvent.textLocale) {
                locale = this.rawEvent.textLocale;
            }
            if (this.rawEvent.entities) {
                var entity = _(this.rawEvent.entities)
                    .filter({ type: "clientInfo" })
                    .filter(function (e) { return !!e.locale; })
                    .first();
                if (entity) {
                    locale = entity.locale;
                }
            }
        }
        return { type: type, locale: locale };
    };
    return CortanaEvent;
}(VoxaEvent_1.IVoxaEvent));
exports.CortanaEvent = CortanaEvent;
function isIMessage(event) {
    return event.type === "message";
}
exports.isIMessage = isIMessage;
function isIConversationUpdate(event) {
    return event.type === "conversationUpdate";
}
exports.isIConversationUpdate = isIConversationUpdate;
//# sourceMappingURL=CortanaEvent.js.map