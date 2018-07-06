"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function register(skill) {
    skill.onRequestStarted((voxaEvent) => {
        const fromState = voxaEvent.session.new ? "entry" : voxaEvent.model.state || "entry";
        voxaEvent.model.flow = [fromState];
    });
    skill.onAfterStateChanged((voxaEvent, reply, transition) => {
        voxaEvent.model.flow = voxaEvent.model.flow || [];
        voxaEvent.model.flow.push(transition.to);
        return transition;
    });
}
exports.register = register;
//# sourceMappingURL=state-flow.js.map