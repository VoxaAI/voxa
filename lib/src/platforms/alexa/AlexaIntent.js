"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class AlexaIntent {
    constructor(rawIntent) {
        this.rawIntent = rawIntent;
        if (rawIntent) {
            this.name = rawIntent.name.replace(/^AMAZON./, "");
            this.params = _(rawIntent.slots)
                .map((s) => [s.name, s.value])
                .fromPairs()
                .value();
        }
        else {
            this.name = "";
            this.params = {};
        }
    }
}
exports.AlexaIntent = AlexaIntent;
//# sourceMappingURL=AlexaIntent.js.map