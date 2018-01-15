"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var AlexaIntent = /** @class */ (function () {
    function AlexaIntent(rawIntent) {
        this.rawIntent = rawIntent;
        if (rawIntent) {
            this.name = rawIntent.name.replace(/^AMAZON./, "");
            this.params = _(rawIntent.slots)
                .map(function (s) { return [s.name, s.value]; })
                .fromPairs()
                .value();
        }
        else {
            this.name = "";
            this.params = {};
        }
    }
    return AlexaIntent;
}());
exports.AlexaIntent = AlexaIntent;
//# sourceMappingURL=AlexaIntent.js.map