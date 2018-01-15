"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
function register(skill) {
    skill.onRequestStarted(function (voxaEvent) {
        var fromState = voxaEvent.session.new ? "entry" : _.get(voxaEvent, "session.attributes.model.state", "entry");
        voxaEvent.flow = [fromState];
    });
    skill.onAfterStateChanged(function (voxaEvent, reply, transition) {
        voxaEvent.flow.push(transition.to);
        return transition;
    });
}
exports.register = register;
//# sourceMappingURL=state-flow.js.map