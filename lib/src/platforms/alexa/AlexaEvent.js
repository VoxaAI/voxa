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
var AlexaIntent_1 = require("./AlexaIntent");
var AlexaEvent = /** @class */ (function (_super) {
    __extends(AlexaEvent, _super);
    function AlexaEvent(event, context) {
        var _this = _super.call(this, event, context) || this;
        _this.session = event.session;
        _this.request = event.request;
        _this.context = event.context;
        _this.executionContext = context;
        _this.rawEvent = event;
        if (_.isEmpty(_.get(_this, "session.attributes"))) {
            _.set(_this, "session.attributes", {});
        }
        if (_.get(event, "request.type") === "LaunchRequest") {
            _this.intent = new AlexaIntent_1.AlexaIntent({ name: "LaunchIntent", slots: {} });
            _this.request.type = "IntentRequest";
        }
        else if (_.get(event, "request.type") === "Display.ElementSelected") {
            _this.intent = new AlexaIntent_1.AlexaIntent({ name: "DisplayElementSelected", slots: {} });
            _this.request.type = "IntentRequest";
        }
        else {
            _this.intent = new AlexaIntent_1.AlexaIntent(_this.request.intent);
        }
        _this.platform = "alexa";
        return _this;
    }
    Object.defineProperty(AlexaEvent.prototype, "user", {
        get: function () {
            return _.get(this, "session.user") || _.get(this, "context.System.user");
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AlexaEvent.prototype, "token", {
        get: function () {
            return _.get(this, "request.token");
        },
        enumerable: true,
        configurable: true
    });
    return AlexaEvent;
}(VoxaEvent_1.IVoxaEvent));
exports.AlexaEvent = AlexaEvent;
//# sourceMappingURL=AlexaEvent.js.map