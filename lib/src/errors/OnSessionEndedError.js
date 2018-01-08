"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class OnSessionEndedError extends Error {
    constructor(errorOnSession) {
        if (errorOnSession instanceof Object && errorOnSession.constructor === Object) {
            errorOnSession = JSON.stringify(errorOnSession, null, 2);
        }
        const message = `Session ended with an error: ${errorOnSession}`;
        super(message);
        this.requestType = "SessionEndedRequest";
    }
}
exports.OnSessionEndedError = OnSessionEndedError;
//# sourceMappingURL=OnSessionEndedError.js.map