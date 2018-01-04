"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnknownRequestType extends Error {
    constructor(requestType) {
        const message = `Unkown request type: ${requestType}`;
        super(message);
        this.requestType = requestType;
    }
}
exports.UnknownRequestType = UnknownRequestType;
//# sourceMappingURL=UnknownRequestType.js.map