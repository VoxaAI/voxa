"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const _ = require("lodash");
const AlexaEvent_1 = require("../../src/platforms/alexa/AlexaEvent");
const AlexaReply_1 = require("../../src/platforms/alexa/AlexaReply");
const stateFlow = require("../../src/plugins/state-flow");
const VoxaApp_1 = require("../../src/VoxaApp");
const tools_1 = require("../tools");
const variables_1 = require("../variables");
const views_1 = require("../views");
const rb = new tools_1.AlexaRequestBuilder();
describe("StateFlow plugin", () => {
    let states;
    let event;
    beforeEach(() => {
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("SomeIntent"));
        event.session = {
            attributes: {
                state: "secondState",
            },
            new: false,
        };
        states = {
            entry: { SomeIntent: "intent" },
            fourthState: () => undefined,
            initState: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
            intent: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
            secondState: () => ({ to: "initState" }),
            thirdState: () => Promise.resolve({ to: "die" }),
        };
    });
    it("should store the execution flow in the request", () => __awaiter(this, void 0, void 0, function* () {
        const skill = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        _.map(states, (state, name) => {
            skill.onState(name, state);
        });
        stateFlow.register(skill);
        const result = yield skill.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(event.model.flow).to.deep.equal(["secondState", "initState", "die"]);
    }));
    it("should not crash on null transition", () => __awaiter(this, void 0, void 0, function* () {
        const skill = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        _.map(states, (state, name) => {
            skill.onState(name, state);
        });
        stateFlow.register(skill);
        event.session.attributes.state = "fourthState";
        event.intent.name = "OtherIntent";
        const result = yield skill.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(event.model.flow).to.deep.equal(["fourthState"]);
    }));
});
//# sourceMappingURL=state-flow.spec.js.map