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
const bluebird = require("bluebird");
const debug = require("debug");
const _ = require("lodash");
const errors_1 = require("./errors");
const log = debug("voxa");
class StateMachine {
    constructor(currentState, config) {
        this.validateConfig(config);
        this.states = config.states;
        this.currentState = this.states[currentState];
        this.onBeforeStateChangedCallbacks = config.onBeforeStateChanged || [];
        this.onAfterStateChangeCallbacks = config.onAfterStateChanged || [];
        this.onUnhandledStateCallbacks = config.onUnhandledState || [];
        // If die event does not exist auto complete it.
        if (!_.has(this.states, "die")) {
            _.assign(this.states, {
                die: { isTerminal: true, name: "die" },
            });
        }
    }
    validateConfig(config) {
        if (!_.has(config, "states")) {
            throw new Error("State machine must have a `states` definition.");
        }
        if (!_.has(config.states, "entry")) {
            throw new Error("State machine must have a `entry` state.");
        }
    }
    checkOnUnhandledState(voxaEvent, voxaReply, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const runCallbacks = (fn) => {
                return fn(voxaEvent, this.currentState.name);
            };
            if (!transition) {
                log("Running onUnhandledStateCallbacks");
                const onUnhandledStateTransitions = yield bluebird.mapSeries(this.onUnhandledStateCallbacks, runCallbacks);
                const onUnhandledStateTransition = _.last(onUnhandledStateTransitions);
                if (!onUnhandledStateTransition) {
                    throw new errors_1.UnhandledState(voxaEvent, onUnhandledStateTransition, this.currentState.name);
                }
                return onUnhandledStateTransition;
            }
            return transition;
        });
    }
    checkForEntryFallback(voxaEvent, reply, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!transition && this.currentState.name !== "entry") {
                // If no response try falling back to entry
                if (!voxaEvent.intent) {
                    throw new Error("Running the state machine without an intent");
                }
                log(`No reply for ${voxaEvent.intent.name} in [${this.currentState.name}]. Trying [entry].`);
                this.currentState = this.states.entry;
                return this.runCurrentState(voxaEvent);
            }
            return transition;
        });
    }
    onAfterStateChanged(voxaEvent, reply, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (transition && !transition.to) {
                _.merge(transition, { to: "die" });
            }
            log(`${this.currentState.name} transition resulted in %j`, transition);
            log("Running onAfterStateChangeCallbacks");
            yield bluebird.mapSeries(this.onAfterStateChangeCallbacks, (fn) => fn(voxaEvent, reply, transition));
            return transition;
        });
    }
    runTransition(voxaEvent, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const onBeforeState = this.onBeforeStateChangedCallbacks;
            yield bluebird.mapSeries(onBeforeState, (fn) => fn(voxaEvent, reply, this.currentState));
            let transition = yield this.runCurrentState(voxaEvent);
            transition = yield this.checkForEntryFallback(voxaEvent, reply, transition);
            transition = yield this.checkOnUnhandledState(voxaEvent, reply, transition);
            transition = yield this.onAfterStateChanged(voxaEvent, reply, transition);
            let to;
            if (transition.to && _.isString(transition.to)) {
                if (!this.states[transition.to]) {
                    throw new errors_1.UnknownState(transition.to);
                }
                to = this.states[transition.to];
                transition.to = to;
            }
            else {
                to = { name: "die" };
            }
            if (reply.isYielding() || !transition.to || !_.isString(transition.to) && transition.to.isTerminal) {
                const result = { to };
                if (_.isString(transition.reply) || _.isArray(transition.reply)) {
                    result.reply = transition.reply;
                }
                return result;
            }
            this.currentState = this.states[to.name];
            return this.runTransition(voxaEvent, reply);
        });
    }
    runCurrentState(voxaEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const self = this;
            if (!voxaEvent.intent) {
                throw new Error("Running the state machine without an intent");
            }
            if (_.get(this.currentState, ["enter", voxaEvent.intent.name])) {
                log(`Running ${this.currentState.name} enter function for ${voxaEvent.intent.name}`);
                return this.currentState.enter[voxaEvent.intent.name](voxaEvent);
            }
            if (_.get(this.currentState, "enter.entry")) {
                log(`Running ${this.currentState.name} enter function entry`);
                return this.currentState.enter.entry(voxaEvent);
            }
            log(`Running simpleTransition for ${this.currentState.name}`);
            const fromState = this.currentState;
            const to = _.get(fromState, ["to", voxaEvent.intent.name]);
            return simpleTransition(this.currentState, to);
            function simpleTransition(state, dest) {
                if (!dest) {
                    return null;
                }
                if (_.isObject(dest)) {
                    return dest;
                }
                if (state.to[dest] && dest !== state.to[dest]) {
                    // on some ocassions a single object like state could have multiple transitions
                    // Eg:
                    // app.onState('entry', {
                    //   WelcomeIntent: 'LaunchIntent',
                    //   LaunchIntent: { reply: 'SomeReply' }
                    // });
                    return simpleTransition(state, state.to[dest]);
                }
                const destObj = self.states[dest];
                if (!destObj) {
                    throw new errors_1.UnknownState(dest);
                }
                return { to: dest };
            }
        });
    }
}
exports.StateMachine = StateMachine;
//# sourceMappingURL=StateMachine.js.map