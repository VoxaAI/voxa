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
function isTransition(object) {
    return object && "to" in object;
}
exports.isTransition = isTransition;
function isState(object) {
    return object && "name" in object;
}
exports.isState = isState;
class StateMachine {
    constructor(config) {
        this.validateConfig(config);
        this.states = config.states;
        this.onBeforeStateChangedCallbacks = config.onBeforeStateChanged || [];
        this.onAfterStateChangeCallbacks = config.onAfterStateChanged || [];
        this.onUnhandledStateCallbacks = config.onUnhandledState || [];
        // If die event does not exist auto complete it.
        if (!_.has(this.states, "core.die")) {
            _.assign(this.states.core, {
                die: { isTerminal: true, name: "die" },
            });
        }
    }
    validateConfig(config) {
        if (!_.has(config, "states")) {
            throw new Error("State machine must have a `states` definition.");
        }
        if (!_.filter(config.states, "entry").length) {
            throw new Error("State machine must have a `entry` state.");
        }
    }
    checkOnUnhandledState(voxaEvent, voxaReply, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isState(this.currentState)) {
                throw new Error("this.currentState is not a state");
            }
            const runCallbacks = (fn) => {
                if (!isState(this.currentState)) {
                    throw new Error("this.currentState is not a state");
                }
                return fn(voxaEvent, this.currentState.name);
            };
            if (!transition || _.isEmpty(transition)) {
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
            log("Checking entry fallback");
            if (!isState(this.currentState)) {
                throw new Error("this.currentState is not a state");
            }
            if (!transition && this.currentState.name !== "entry") {
                // If no response try falling back to entry
                if (!voxaEvent.intent) {
                    throw new Error("Running the state machine without an intent");
                }
                log(`No reply for ${voxaEvent.intent.name} in [${this.currentState.name}]. Trying [entry].`);
                this.currentState = this.states.core.entry;
                return this.runCurrentState(voxaEvent, reply);
            }
            return transition;
        });
    }
    onAfterStateChanged(voxaEvent, reply, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            if (transition && !transition.to) {
                _.merge(transition, { to: "die" });
            }
            if (!isState(this.currentState)) {
                throw new Error("this.currentState is not a state");
            }
            log(`${this.currentState.name} transition resulted in`, transition);
            log("Running onAfterStateChangeCallbacks");
            yield bluebird.mapSeries(this.onAfterStateChangeCallbacks, (fn) => {
                return fn(voxaEvent, reply, transition);
            });
            log("Transition is now", transition);
            return transition;
        });
    }
    runTransition(currentState, voxaEvent, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            this.currentState = _.get(this.states, [voxaEvent.platform, currentState]) || _.get(this.states, ["core", currentState]);
            const onBeforeState = this.onBeforeStateChangedCallbacks;
            log("Running onBeforeStateChanged");
            yield bluebird.mapSeries(onBeforeState, (fn) => {
                if (!isState(this.currentState)) {
                    throw new Error("this.currentState is not a state");
                }
                return fn(voxaEvent, reply, this.currentState);
            });
            let transition = yield this.runCurrentState(voxaEvent, reply);
            if (!!transition && !_.isObject(transition)) {
                transition = { to: "die", flow: "terminate" };
                reply.terminate();
            }
            transition = yield this.checkForEntryFallback(voxaEvent, reply, transition);
            transition = yield this.checkOnUnhandledState(voxaEvent, reply, transition);
            transition = yield this.onAfterStateChanged(voxaEvent, reply, transition);
            let to;
            if (_.isObject(transition) && !_.isEmpty(transition) && !transition.flow) {
                transition = _.merge({}, transition, { flow: "continue" });
                transition.flow = "continue";
            }
            if (transition.to && _.isString(transition.to)) {
                if (!this.states.core[transition.to] && !_.get(this.states, [voxaEvent.platform, transition.to])) {
                    throw new errors_1.UnknownState(transition.to);
                }
                to = _.get(this.states, [voxaEvent.platform, transition.to]) || this.states.core[transition.to];
                transition = _.merge({}, transition, { to });
            }
            else {
                to = { name: "die" };
                transition = _.merge({}, transition, { flow: "terminate" });
            }
            if (transition.flow === "terminate") {
                reply.terminate();
            }
            if (isState(transition.to)) {
                if (transition.to.isTerminal) {
                    reply.terminate();
                }
            }
            if (transition.flow !== "continue" || !transition.to || isState(transition.to) && transition.to.isTerminal) {
                return _.merge({}, transition, to);
            }
            return this.runTransition(to.name, voxaEvent, reply);
        });
    }
    runCurrentState(voxaEvent, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!voxaEvent.intent) {
                throw new Error("Running the state machine without an intent");
            }
            if (!isState(this.currentState)) {
                throw new Error(`${JSON.stringify(this.currentState)} is not a state`);
            }
            if (_.get(this.currentState, ["enter", voxaEvent.intent.name])) {
                log(`Running ${this.currentState.name} enter function for ${voxaEvent.intent.name}`);
                return this.currentState.enter[voxaEvent.intent.name](voxaEvent, reply);
            }
            if (_.get(this.currentState, "enter.entry")) {
                log(`Running ${this.currentState.name} enter function entry`);
                return this.currentState.enter.entry(voxaEvent, reply);
            }
            const fromState = this.currentState;
            // we want to allow declarative states
            // like:
            // app.onIntent('LaunchIntent', {
            //   to: 'entry',
            //   ask: 'Welcome',
            //   Hint: 'Hint'
            // });
            //
            if (!isState(fromState)) {
                throw new Error(`${JSON.stringify(fromState)} is not a state`);
            }
            if (isTransition(fromState.to)) {
                return fromState.to;
            }
            log(`Running simpleTransition for ${this.currentState.name}`);
            let to = _.get(fromState, ["to", voxaEvent.intent.name]);
            if (!to) {
                to = _.get(this.states, ["core", fromState.name, "to", voxaEvent.intent.name]);
            }
            return this.simpleTransition(voxaEvent, this.currentState, to);
        });
    }
    simpleTransition(voxaEvent, state, dest) {
        if (!dest) {
            return {};
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
            return this.simpleTransition(voxaEvent, state, state.to[dest]);
        }
        const destObj = _.get(this.states, [voxaEvent.platform, dest]) || _.get(this.states, ["core", dest]);
        if (!destObj) {
            throw new errors_1.UnknownState(dest);
        }
        return { to: dest };
    }
}
exports.StateMachine = StateMachine;
//# sourceMappingURL=StateMachine.js.map