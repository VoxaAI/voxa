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
var OnSessionEndedError = /** @class */ (function (_super) {
    __extends(OnSessionEndedError, _super);
    function OnSessionEndedError(errorOnSession) {
        var _this = this;
        if (errorOnSession instanceof Object && errorOnSession.constructor === Object) {
            errorOnSession = JSON.stringify(errorOnSession, null, 2);
        }
        var message = "Session ended with an error: " + errorOnSession;
        _this = _super.call(this, message) || this;
        _this.requestType = "SessionEndedRequest";
        return _this;
    }
    return OnSessionEndedError;
}(Error));
exports.OnSessionEndedError = OnSessionEndedError;
//# sourceMappingURL=OnSessionEndedError.js.map