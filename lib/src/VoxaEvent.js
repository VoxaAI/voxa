"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class IVoxaEvent {
    constructor(event, context) {
        this.requestToIntent = {};
        this.requestToRequest = {};
        this.rawEvent = _.cloneDeep(event);
        this.executionContext = context;
    }
    mapRequestToIntent() {
        const requestType = this.request.type;
        const intentName = this.requestToIntent[requestType];
        if (!intentName) {
            return;
        }
        _.set(this, "intent", {
            name: intentName,
            slots: {},
        });
        _.set(this, "request.type", "IntentRequest");
    }
    mapRequestToRequest() {
        const requestType = this.request.type;
        const newRequestType = this.requestToRequest[requestType];
        if (!newRequestType) {
            return;
        }
        _.set(this, "request.type", newRequestType);
    }
}
exports.IVoxaEvent = IVoxaEvent;
//# sourceMappingURL=VoxaEvent.js.map