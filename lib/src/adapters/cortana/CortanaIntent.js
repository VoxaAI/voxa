"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class CortanaIntent {
    constructor(message) {
        this.rawIntent = message;
        const intentEntity = _.find(this.rawIntent.entities, { type: "Intent" });
        if (!intentEntity) {
            this.name = "";
            this.params = {};
        }
        else {
            if (intentEntity.name === "Microsoft.Launch") {
                this.name = "LaunchIntent";
                this.params = {};
            }
            else {
                this.name = intentEntity.name || "";
                this.params = {};
            }
        }
    }
}
exports.CortanaIntent = CortanaIntent;
//# sourceMappingURL=CortanaIntent.js.map