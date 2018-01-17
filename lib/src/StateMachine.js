"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var bluebird = require("bluebird");
var debug = require("debug");
var _ = require("lodash");
var errors_1 = require("./errors");
var log = debug("voxa");
function isTransition(object) {
    return object && "to" in object;
}
exports.isTransition = isTransition;
function isState(object) {
    return object && "name" in object;
}
exports.isState = isState;
var StateMachine = /** @class */ (function () {
    function StateMachine(currentState, config) {
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
    StateMachine.prototype.validateConfig = function (config) {
        if (!_.has(config, "states")) {
            throw new Error("State machine must have a `states` definition.");
        }
        if (!_.has(config.states, "entry")) {
            throw new Error("State machine must have a `entry` state.");
        }
    };
    StateMachine.prototype.checkOnUnhandledState = function (voxaEvent, voxaReply, transition) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var runCallbacks, onUnhandledStateTransitions, onUnhandledStateTransition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        runCallbacks = function (fn) {
                            return fn(voxaEvent, _this.currentState.name);
                        };
                        if (!!transition) return [3 /*break*/, 2];
                        log("Running onUnhandledStateCallbacks");
                        return [4 /*yield*/, bluebird.mapSeries(this.onUnhandledStateCallbacks, runCallbacks)];
                    case 1:
                        onUnhandledStateTransitions = _a.sent();
                        onUnhandledStateTransition = _.last(onUnhandledStateTransitions);
                        if (!onUnhandledStateTransition) {
                            throw new errors_1.UnhandledState(voxaEvent, onUnhandledStateTransition, this.currentState.name);
                        }
                        return [2 /*return*/, onUnhandledStateTransition];
                    case 2: return [2 /*return*/, transition];
                }
            });
        });
    };
    StateMachine.prototype.checkForEntryFallback = function (voxaEvent, reply, transition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!transition && this.currentState.name !== "entry") {
                    // If no response try falling back to entry
                    if (!voxaEvent.intent) {
                        throw new Error("Running the state machine without an intent");
                    }
                    log("No reply for " + voxaEvent.intent.name + " in [" + this.currentState.name + "]. Trying [entry].");
                    this.currentState = this.states.entry;
                    return [2 /*return*/, this.runCurrentState(voxaEvent, reply)];
                }
                return [2 /*return*/, transition];
            });
        });
    };
    StateMachine.prototype.onAfterStateChanged = function (voxaEvent, reply, transition) {
        return __awaiter(this, void 0, void 0, function () {
            var count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (transition && !transition.to) {
                            _.merge(transition, { to: "die" });
                        }
                        log(this.currentState.name + " transition resulted in %j", transition);
                        log("Running onAfterStateChangeCallbacks");
                        count = 0;
                        return [4 /*yield*/, bluebird.mapSeries(this.onAfterStateChangeCallbacks, function (fn) {
                                count += 1;
                                return fn(voxaEvent, reply, transition);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, transition];
                }
            });
        });
    };
    StateMachine.prototype.runTransition = function (voxaEvent, reply) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var onBeforeState, transition, to, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        onBeforeState = this.onBeforeStateChangedCallbacks;
                        return [4 /*yield*/, bluebird.mapSeries(onBeforeState, function (fn) { return fn(voxaEvent, reply, _this.currentState); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.runCurrentState(voxaEvent, reply)];
                    case 2:
                        transition = _a.sent();
                        return [4 /*yield*/, this.checkForEntryFallback(voxaEvent, reply, transition)];
                    case 3:
                        transition = _a.sent();
                        return [4 /*yield*/, this.checkOnUnhandledState(voxaEvent, reply, transition)];
                    case 4:
                        transition = _a.sent();
                        return [4 /*yield*/, this.onAfterStateChanged(voxaEvent, reply, transition)];
                    case 5:
                        transition = _a.sent();
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
                        if (reply.isYielding() || !transition.to || isState(transition.to) && transition.to.isTerminal) {
                            result = { to: to };
                            if (_.isString(transition.reply) || _.isArray(transition.reply)) {
                                result.reply = transition.reply;
                            }
                            return [2 /*return*/, result];
                        }
                        ;
                        this.currentState = this.states[to.name];
                        return [2 /*return*/, this.runTransition(voxaEvent, reply)];
                }
            });
        });
    };
    StateMachine.prototype.runCurrentState = function (voxaEvent, reply) {
        return __awaiter(this, void 0, void 0, function () {
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
                var destObj = self.states[dest];
                if (!destObj) {
                    throw new errors_1.UnknownState(dest);
                }
                return { to: dest };
            }
            var self, fromState, to;
            return __generator(this, function (_a) {
                self = this;
                if (!voxaEvent.intent) {
                    throw new Error("Running the state machine without an intent");
                }
                if (_.get(this.currentState, ["enter", voxaEvent.intent.name])) {
                    log("Running " + this.currentState.name + " enter function for " + voxaEvent.intent.name);
                    return [2 /*return*/, this.currentState.enter[voxaEvent.intent.name](voxaEvent, reply)];
                }
                if (_.get(this.currentState, "enter.entry")) {
                    log("Running " + this.currentState.name + " enter function entry");
                    return [2 /*return*/, this.currentState.enter.entry(voxaEvent, reply)];
                }
                fromState = this.currentState;
                // we want to allow declarative states
                // like:
                // app.onIntent('LaunchIntent', {
                //   to: 'entry',
                //   ask: 'Welcome',
                //   Hint: 'Hint'
                // });
                //
                if (isTransition(fromState.to)) {
                    return [2 /*return*/, fromState.to];
                }
                log("Running simpleTransition for " + this.currentState.name);
                to = _.get(fromState, ["to", voxaEvent.intent.name]);
                return [2 /*return*/, simpleTransition(this.currentState, to)];
            });
        });
    };
    return StateMachine;
}());
exports.StateMachine = StateMachine;
//# sourceMappingURL=StateMachine.js.map