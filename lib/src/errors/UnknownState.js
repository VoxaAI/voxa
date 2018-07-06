"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UnknownState extends Error {
    constructor(state) {
        const message = `Unknown state ${state}`;
        super(message);
        this.state = state;
    }
}
exports.UnknownState = UnknownState;
//# sourceMappingURL=UnknownState.js.map