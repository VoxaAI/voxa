"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class Model {
    static fromEvent(voxaEvent) {
        return new this(voxaEvent.session.attributes);
    }
    constructor(data = {}) {
        _.assign(this, data);
    }
    serialize() {
        return this;
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map