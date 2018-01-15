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
var DialogFlowIntent_1 = require("./DialogFlowIntent");
var DialogFlowSession_1 = require("./DialogFlowSession");
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
        _this.session = new DialogFlowSession_1.DialogFlowSession(event);
        _this.intent = new DialogFlowIntent_1.DialogFlowIntent(event);
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
//# sourceMappingURL=DialogFlowEvent.js.map