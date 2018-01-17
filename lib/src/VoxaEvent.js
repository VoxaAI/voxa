"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var IVoxaEvent = /** @class */ (function () {
    function IVoxaEvent(event, context) {
        this.requestToIntent = {};
        this.requestToRequest = {};
        this.rawEvent = event;
        this.executionContext = context;
    }
    IVoxaEvent.prototype.mapRequestToIntent = function () {
        var requestType = this.request.type;
        var intentName = this.requestToIntent[requestType];
        if (!intentName) {
            return;
        }
        _.set(this, "intent", {
            name: intentName,
            slots: {},
        });
        _.set(this, "request.type", "IntentRequest");
    };
    IVoxaEvent.prototype.mapRequestToRequest = function () {
        var requestType = this.request.type;
        var newRequestType = this.requestToRequest[requestType];
        if (!newRequestType) {
            return;
        }
        _.set(this, "request.type", newRequestType);
    };
    return IVoxaEvent;
}());
exports.IVoxaEvent = IVoxaEvent;
//# sourceMappingURL=VoxaEvent.js.map