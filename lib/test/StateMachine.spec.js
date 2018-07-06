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
const chai_1 = require("chai");
const simple = require("simple-mock");
const AlexaEvent_1 = require("../src/platforms/alexa/AlexaEvent");
const AlexaReply_1 = require("../src/platforms/alexa/AlexaReply");
const StateMachine_1 = require("../src/StateMachine");
const tools_1 = require("./tools");
const rb = new tools_1.AlexaRequestBuilder();
describe("StateMachine", () => {
    let states;
    let voxaEvent;
    let reply;
    beforeEach(() => {
        voxaEvent = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));
        reply = new AlexaReply_1.AlexaReply();
        states = {
            core: {
                entry: {
                    enter: {
                        entry: () => ({ tell: "ExitIntent.Farewell", to: "die", flow: "terminate" }),
                    },
                    name: "entry",
                },
                initState: {
                    name: "initState",
                    to: {
                        flow: "terminate",
                        tell: "ExitIntent.Farewell",
                        to: "die",
                    },
                },
                secondState: {
                    enter: {
                        entry: () => ({ to: "initState", flow: "continue" }),
                    },
                    name: "secondState",
                },
                thirdState: {
                    enter: {
                        entry: () => Promise.resolve({ to: "die", flow: "terminate" }),
                    },
                    name: "thirdState",
                },
            },
        };
    });
    it("should fail if there's no entry state", () => {
        chai_1.expect(() => new StateMachine_1.StateMachine({ states: {} })).to.throw("State machine must have a `entry` state.");
    });
    describe("runTransition", () => {
        it("should transition to die", () => __awaiter(this, void 0, void 0, function* () {
            const stateMachine = new StateMachine_1.StateMachine({ states });
            const response = yield stateMachine.runTransition("initState", voxaEvent, reply);
            if (StateMachine_1.isState(response.to)) {
                chai_1.expect(response.to.name).to.equal(states.core.die.name);
            }
        }));
        it("should transition more than one state", () => __awaiter(this, void 0, void 0, function* () {
            const stateMachine = new StateMachine_1.StateMachine({ states });
            const response = yield stateMachine.runTransition("secondState", voxaEvent, reply);
            if (StateMachine_1.isState(response.to)) {
                chai_1.expect(response.to.name).to.equal(states.core.die.name);
            }
        }));
        it("should call onBeforeStateChangedCallbacks", () => __awaiter(this, void 0, void 0, function* () {
            const onBeforeStateChanged = simple.stub();
            const stateMachine = new StateMachine_1.StateMachine({ onBeforeStateChanged: [onBeforeStateChanged], states });
            yield stateMachine.runTransition("secondState", voxaEvent, reply);
            chai_1.expect(onBeforeStateChanged.called).to.be.true;
            chai_1.expect(onBeforeStateChanged.callCount).to.equal(2);
        }));
        it("should transition on promises change", () => __awaiter(this, void 0, void 0, function* () {
            const stateMachine = new StateMachine_1.StateMachine({ states });
            const response = yield stateMachine.runTransition("thirdState", voxaEvent, reply);
            if (StateMachine_1.isState(response.to)) {
                chai_1.expect(response.to.name).to.equal(states.core.die.name);
            }
        }));
        it("should transition depending on intent if state.to ", () => __awaiter(this, void 0, void 0, function* () {
            states.core.entry = { to: { TestIntent: "die" }, name: "entry" };
            const stateMachine = new StateMachine_1.StateMachine({ states });
            voxaEvent.intent.name = "TestIntent";
            const response = yield stateMachine.runTransition("entry", voxaEvent, reply);
            if (StateMachine_1.isState(response.to)) {
                chai_1.expect(response.to.name).to.equal(states.core.die.name);
            }
        }));
        it("should transition to die if result is not an object", () => __awaiter(this, void 0, void 0, function* () {
            states.core.thirdState.enter = { entry: () => "LaunchIntent.OpenResponse" };
            const stateMachine = new StateMachine_1.StateMachine({ states });
            const response = yield stateMachine.runTransition("thirdState", voxaEvent, reply);
            if (StateMachine_1.isState(response.to)) {
                chai_1.expect(response.to.name).to.equal(states.core.die.name);
            }
        }));
        it("should throw an error if there's no transition and no intent", (done) => {
            delete voxaEvent.intent;
            const stateMachine = new StateMachine_1.StateMachine({ states });
            stateMachine.runTransition("thirdState", voxaEvent, reply)
                .then(() => done("Should have thrown"), (error) => {
                chai_1.expect(error.message).to.equal("Running the state machine without an intent");
                done();
            });
        });
        describe("UnhandledState", () => {
            it("should throw UnhandledState on a falsey response from the state transition", (done) => {
                states.core.entry.enter = { entry: () => null };
                const stateMachine = new StateMachine_1.StateMachine({ states });
                const launchIntent = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("LaunchIntent"));
                stateMachine.runTransition("entry", launchIntent, reply).then(() => done("should have thrown"), (error) => {
                    chai_1.expect(error.message).to.equal("LaunchIntent went unhandled on entry state");
                    done();
                });
            });
            it("should throw an exception on invalid transition from pojo controller", (done) => {
                states.core.entry = { to: { TestIntent: "die" }, name: "entry" };
                const stateMachine = new StateMachine_1.StateMachine({ states });
                voxaEvent.intent.name = "OtherIntent";
                stateMachine.runTransition("entry", voxaEvent, reply).then(() => done("should have thrown"), (error) => {
                    chai_1.expect(error.message).to.equal("OtherIntent went unhandled on entry state");
                    done();
                });
            });
            it("should execute the onUnhandledState callbacks on invalid transition from pojo controller", () => __awaiter(this, void 0, void 0, function* () {
                states.entry = { to: { TestIntent: "die" }, name: "entry" };
                const onUnhandledState = simple.stub().returnWith(Promise.resolve({ to: "die" }));
                const stateMachine = new StateMachine_1.StateMachine({
                    onUnhandledState: [onUnhandledState],
                    states,
                });
                voxaEvent.intent.name = "OtherIntent";
                const response = yield stateMachine.runTransition("entry", voxaEvent, reply);
                return chai_1.expect(response).to.deep.equal({
                    flow: "terminate",
                    isTerminal: true,
                    name: "die",
                    tell: "ExitIntent.Farewell",
                    to: {
                        isTerminal: true,
                        name: "die",
                    },
                });
            }));
        });
        it("should throw UnknownState when transition.to goes to an undefined state from simple transition", (done) => {
            states.core.entry = { to: { LaunchIntent: "undefinedState" }, name: "entry" };
            const stateMachine = new StateMachine_1.StateMachine({ states });
            voxaEvent.intent.name = "LaunchIntent";
            stateMachine.runTransition("entry", voxaEvent, reply).then(() => done("Should have thrown"), (error) => {
                chai_1.expect(error.message).to.equal("Unknown state undefinedState");
                done();
            });
        });
        it("should throw UnknownState when transition.to goes to an undefined state", (done) => {
            states.core.someState = { enter: { entry: () => ({ to: "undefinedState" }) }, name: "someState" };
            const stateMachine = new StateMachine_1.StateMachine({ states });
            stateMachine.runTransition("someState", voxaEvent, reply).then(() => done("should have thrown"), (error) => {
                chai_1.expect(error.message).to.equal("Unknown state undefinedState");
                done();
            });
        });
        it("should fallback to entry on no response", () => __awaiter(this, void 0, void 0, function* () {
            states.core.someState = {
                enter: {
                    entry: simple.stub().returnWith(null),
                },
                name: "someState",
            };
            const stateMachine = new StateMachine_1.StateMachine({ states });
            voxaEvent.intent.name = "LaunchIntent";
            const transition = yield stateMachine.runTransition("someState", voxaEvent, reply);
            // expect(states.someState.enter.entry.called).to.be.true;
            chai_1.expect(transition).to.deep.equal({
                flow: "terminate",
                isTerminal: true,
                name: "die",
                tell: "ExitIntent.Farewell",
                to: {
                    isTerminal: true,
                    name: "die",
                },
            });
        }));
    });
    describe("runCurrentState", () => {
        it("should throw an error if run without an intent", (done) => {
            delete voxaEvent.intent;
            const stateMachine = new StateMachine_1.StateMachine({ states });
            stateMachine.runCurrentState(voxaEvent, reply).then(() => "should have thrown", (error) => {
                chai_1.expect(error.message).to.equal("Running the state machine without an intent");
                done();
            });
        });
        it("should run the specific intent enter function", () => __awaiter(this, void 0, void 0, function* () {
            const stateMachine = new StateMachine_1.StateMachine({ states });
            const stub1 = simple.stub();
            const stub2 = simple.stub();
            stateMachine.currentState = {
                enter: {
                    YesIntent: stub1,
                    entry: stub2,
                    name: "enter",
                },
                isTerminal: false,
                name: "someState",
            };
            yield stateMachine.runCurrentState(voxaEvent, reply);
            chai_1.expect(stub1.called).to.be.true;
            chai_1.expect(stub2.called).to.be.false;
        }));
    });
});
//# sourceMappingURL=StateMachine.spec.js.map