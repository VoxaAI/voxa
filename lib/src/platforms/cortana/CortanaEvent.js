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
var CortanaIntent_1 = require("./CortanaIntent");
var CortanaEvent = /** @class */ (function (_super) {
    __extends(CortanaEvent, _super);
    function CortanaEvent(message, context, stateData, intent) {
        var _this = _super.call(this, message, context) || this;
        _this.platform = "cortana";
        _this.session = {
            attributes: stateData.privateConversationData || {},
            new: _.isEmpty(stateData.privateConversationData),
            sessionId: _.get(message, "address.conversation.id"),
        };
        _this.context = {};
        if (intent) {
            _this.intent = intent;
        }
        else {
            _this.intent = new CortanaIntent_1.CortanaIntent(message);
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
    Object.defineProperty(CortanaEvent.prototype, "request", {
        get: function () {
            var type = this.rawEvent.type;
            var locale;
            if (type === "endOfConversation") {
                type = "SessionEndedRequest";
            }
            if (this.intent && this.intent.name) {
                type = "IntentRequest";
            }
            if (CortanaIntent_1.isIMessage(this.rawEvent)) {
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
        },
        enumerable: true,
        configurable: true
    });
    return CortanaEvent;
}(VoxaEvent_1.IVoxaEvent));
exports.CortanaEvent = CortanaEvent;
//# sourceMappingURL=CortanaEvent.js.map