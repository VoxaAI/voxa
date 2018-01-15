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
var UnhandledState = /** @class */ (function (_super) {
    __extends(UnhandledState, _super);
    function UnhandledState(voxaEvent, transition, fromState) {
        var _this = this;
        var message;
        if (voxaEvent.intent) {
            message = voxaEvent.intent.name + " went unhandled on " + fromState + " state";
        }
        else {
            message = "State machine went unhandled on " + fromState + " state";
        }
        _this = _super.call(this, message) || this;
        _this.event = voxaEvent;
        _this.fromState = fromState;
        _this.transition = transition;
        return _this;
    }
    return UnhandledState;
}(Error));
exports.UnhandledState = UnhandledState;
//# sourceMappingURL=UnhandledState.js.map