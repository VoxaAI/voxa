"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnhandledState extends Error {
    constructor(voxaEvent, transition, fromState) {
        let message;
        if (voxaEvent.intent) {
            message = `${voxaEvent.intent.name} went unhandled on ${fromState} state`;
        }
        else {
            message = `State machine went unhandled on ${fromState} state`;
        }
        super(message);
        this.event = voxaEvent;
        this.fromState = fromState;
        this.transition = transition;
    }
}
exports.UnhandledState = UnhandledState;
class UnknownState extends Error {
    constructor(state) {
        const message = `Unknown state ${state}`;
        super(message);
        this.state = state;
    }
}
exports.UnknownState = UnknownState;
class UnknownRequestType extends Error {
    constructor(requestType) {
        const message = `Unkown request type: ${requestType}`;
        super(message);
        this.requestType = requestType;
    }
}
exports.UnknownRequestType = UnknownRequestType;
class OnSessionEndedError extends Error {
    constructor(errorOnSession) {
        if (errorOnSession instanceof Object && errorOnSession.constructor === Object) {
            errorOnSession = JSON.stringify(errorOnSession, null, 2);
        }
        const message = `Session ended with an error: ${errorOnSession}`;
        super(message);
        this.requestType = 'SessionEndedRequest';
    }
}
exports.OnSessionEndedError = OnSessionEndedError;
//# sourceMappingURL=Errors.js.map