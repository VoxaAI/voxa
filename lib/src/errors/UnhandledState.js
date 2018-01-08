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
//# sourceMappingURL=UnhandledState.js.map