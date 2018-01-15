"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var Model = /** @class */ (function () {
    function Model(data) {
        if (data === void 0) { data = {}; }
        _.assign(this, data);
    }
    Model.fromEvent = function (voxaEvent) {
        return new this(voxaEvent.session.attributes.model);
    };
    Model.prototype.serialize = function () {
        return this;
    };
    return Model;
}());
exports.Model = Model;
//# sourceMappingURL=Model.js.map