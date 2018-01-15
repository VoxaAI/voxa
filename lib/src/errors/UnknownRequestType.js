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
var UnknownRequestType = /** @class */ (function (_super) {
    __extends(UnknownRequestType, _super);
    function UnknownRequestType(requestType) {
        var _this = this;
        var message = "Unkown request type: " + requestType;
        _this = _super.call(this, message) || this;
        _this.requestType = requestType;
        return _this;
    }
    return UnknownRequestType;
}(Error));
exports.UnknownRequestType = UnknownRequestType;
//# sourceMappingURL=UnknownRequestType.js.map