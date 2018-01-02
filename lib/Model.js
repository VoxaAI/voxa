"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class Model {
    constructor(data = {}) {
        _.assign(this, data);
    }
    static fromEvent(voxaEvent) {
        return new this(voxaEvent.session.attributes.model);
    }
    serialize() {
        return this;
    }
}
exports.Model = Model;
//# sourceMappingURL=Model.js.map