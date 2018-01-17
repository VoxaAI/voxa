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
var i18n = require("i18next");
var _ = require("lodash");
var directives_1 = require("./directives");
var errors_1 = require("./errors");
var Model_1 = require("./Model");
var Renderer_1 = require("./renderers/Renderer");
var StateMachine_1 = require("./StateMachine");
var log = debug("voxa");
var VoxaApp = /** @class */ (function () {
    function VoxaApp(config) {
        var _this = this;
        this.config = config;
        this.eventHandlers = {};
        this.directiveHandlers = [];
        this.requestHandlers = {
            SessionEndedRequest: this.handleOnSessionEnded.bind(this),
        };
        _.forEach(this.requestTypes, function (requestType) { return _this.registerRequestHandler(requestType); });
        this.registerEvents();
        this.onError(function (voxaEvent, error, ReplyClass) {
            log("onError");
            log(error);
            log(error.stack);
            var response = new ReplyClass(voxaEvent, _this.renderer);
            response.response.statements.push("An unrecoverable error occurred.");
            return response;
        }, true);
        this.states = {};
        this.config = _.assign({
            Model: Model_1.Model,
            RenderClass: Renderer_1.Renderer,
        }, this.config);
        this.validateConfig();
        this.i18nextPromise = new Promise(function (resolve, reject) {
            i18n.init({
                fallbackLng: "en",
                load: "all",
                nonExplicitWhitelist: true,
                resources: _this.config.views,
            }, function (err, t) {
                if (err) {
                    return reject(err);
                }
                return resolve(t);
            });
        });
        this.renderer = new this.config.RenderClass(this.config);
        // this can be used to plug new information in the request
        // default is to just initialize the model
        this.onRequestStarted(this.transformRequest);
        // run the state machine for intentRequests
        this.onIntentRequest(this.runStateMachine, true);
        this.onAfterStateChanged(this.renderDirectives);
        this.onBeforeReplySent(this.serializeModel);
        _.map([directives_1.ask, directives_1.askP, directives_1.tell, directives_1.tellP, directives_1.say, directives_1.sayP, directives_1.reprompt, directives_1.directives, directives_1.reply], function (handler) { return _this.registerDirectiveHandler(handler, handler.name); });
    }
    VoxaApp.prototype.registerDirectiveHandler = function (handler, key) {
        this.directiveHandlers.push({ handler: handler, key: key });
    };
    VoxaApp.prototype.validateConfig = function () {
        if (!this.config.Model.fromEvent) {
            throw new Error("Model should have a fromEvent method");
        }
        if (!this.config.Model.serialize && !(this.config.Model.prototype && this.config.Model.prototype.serialize)) {
            throw new Error("Model should have a serialize method");
        }
    };
    Object.defineProperty(VoxaApp.prototype, "requestTypes", {
        /*
         * This way we can simply override the method if we want different request types
         */
        get: function () {
            return [
                "IntentRequest",
                "SessionEndedRequest",
            ];
        },
        enumerable: true,
        configurable: true
    });
    VoxaApp.prototype.handleOnSessionEnded = function (voxaEvent, response) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionEndedHandlers, replies, lastReply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sessionEndedHandlers = this.getOnSessionEndedHandlers();
                        return [4 /*yield*/, bluebird.mapSeries(sessionEndedHandlers, function (fn) { return fn(voxaEvent, response); })];
                    case 1:
                        replies = _a.sent();
                        lastReply = _.last(replies);
                        if (lastReply) {
                            return [2 /*return*/, lastReply];
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /*
     * iterate on all error handlers and simply return the first one that
     * generates a reply
     */
    VoxaApp.prototype.handleErrors = function (event, error, ReplyClass) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var errorHandlers, replies, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        errorHandlers = this.getOnErrorHandlers();
                        return [4 /*yield*/, bluebird.map(errorHandlers, function (errorHandler) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, errorHandler(event, error, ReplyClass)];
                                        case 1: return [2 /*return*/, _a.sent()];
                                    }
                                });
                            }); })];
                    case 1:
                        replies = _a.sent();
                        response = _.find(replies);
                        if (!response) {
                            response = new ReplyClass(event, this.renderer);
                        }
                        response.error = error;
                        return [2 /*return*/, response];
                }
            });
        });
    };
    // Call the specific request handlers for each request type
    VoxaApp.prototype.execute = function (voxaEvent, ReplyClass) {
        return __awaiter(this, void 0, void 0, function () {
            var response_1, appId, requestHandler, _a, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        log("Received new event");
                        log(voxaEvent);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 11]);
                        response_1 = new ReplyClass(voxaEvent, this.renderer);
                        // Validate that this AlexaRequest originated from authorized source.
                        if (this.config.appIds) {
                            appId = voxaEvent.context.application.applicationId;
                            if (_.isString(this.config.appIds) && this.config.appIds !== appId) {
                                log("The applicationIds don't match: \"" + appId + "\"  and  \"" + this.config.appIds + "\"");
                                throw new Error("Invalid applicationId");
                            }
                            if (_.isArray(this.config.appIds) && !_.includes(this.config.appIds, appId)) {
                                log("The applicationIds don't match: \"" + appId + "\"  and  \"" + this.config.appIds + "\"");
                                throw new Error("Invalid applicationId");
                            }
                        }
                        if (!this.requestHandlers[voxaEvent.request.type]) {
                            throw new errors_1.UnknownRequestType(voxaEvent.request.type);
                        }
                        requestHandler = this.requestHandlers[voxaEvent.request.type];
                        _a = voxaEvent.request.type;
                        switch (_a) {
                            case "IntentRequest": return [3 /*break*/, 2];
                            case "SessionEndedRequest": return [3 /*break*/, 2];
                        }
                        return [3 /*break*/, 6];
                    case 2: return [4 /*yield*/, bluebird.mapSeries(this.getOnRequestStartedHandlers(), function (fn) {
                            return fn(voxaEvent, response_1);
                        })];
                    case 3:
                        result = _b.sent();
                        if (voxaEvent.request.type === "SessionEndedRequest" && _.get(voxaEvent, "request.reason") === "ERROR") {
                            throw new errors_1.OnSessionEndedError(_.get(voxaEvent, "request.error"));
                        }
                        // call all onSessionStarted callbacks serially.
                        return [4 /*yield*/, bluebird.mapSeries(this.getOnSessionStartedHandlers(), function (fn) { return fn(voxaEvent, response_1); })];
                    case 4:
                        // call all onSessionStarted callbacks serially.
                        _b.sent();
                        return [4 /*yield*/, requestHandler(voxaEvent, response_1)];
                    case 5: 
                    // Route the request to the proper handler which may have been overriden.
                    return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, requestHandler(voxaEvent, response_1)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        error_1 = _b.sent();
                        return [4 /*yield*/, this.handleErrors(voxaEvent, error_1, ReplyClass)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /*
     * Request handlers are in charge of responding to the different request types alexa sends,
     * in general they will defer to the proper event handler
     */
    VoxaApp.prototype.registerRequestHandler = function (requestType) {
        var _this = this;
        // .filter(requestType => !this.requestHandlers[requestType])
        if (this.requestHandlers[requestType]) {
            return;
        }
        var eventName = "on" + _.upperFirst(requestType);
        this.registerEvent(eventName);
        this.requestHandlers[requestType] = function (voxaEvent, response) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var capitalizedEventName, runCallback, result, lastReply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        log(eventName);
                        capitalizedEventName = _.upperFirst(_.camelCase(eventName));
                        runCallback = function (fn) { return fn.call(_this, voxaEvent, response); };
                        return [4 /*yield*/, bluebird.mapSeries(this["get" + capitalizedEventName + "Handlers"](), runCallback)];
                    case 1:
                        result = _a.sent();
                        lastReply = _(result).filter().last();
                        if (lastReply) {
                            return [2 /*return*/, lastReply];
                        }
                        // else we return the one we started with
                        return [2 /*return*/, response];
                }
            });
        }); };
    };
    /*
     * Event handlers are array of callbacks that get executed when an event is triggered
     * they can return a promise if async execution is needed,
     * most are registered with the voxaEvent handlers
     * however there are some that don't map exactly to a voxaEvent and we register them in here,
     * override the method to add new events.
     */
    VoxaApp.prototype.registerEvents = function () {
        // Called when the request starts.
        this.registerEvent("onRequestStarted");
        // Called when the session starts.
        this.registerEvent("onSessionStarted");
        // Called when the user ends the session.
        this.registerEvent("onSessionEnded");
        // Sent whenever there's an unhandled error in the onIntent code
        this.registerEvent("onError");
        //
        // this are all StateMachine events
        this.registerEvent("onBeforeStateChanged");
        this.registerEvent("onAfterStateChanged");
        this.registerEvent("onBeforeReplySent");
        // Sent when the state machine failed to return a carrect reply
        this.registerEvent("onUnhandledState");
    };
    /*
     * Create an event handler register for the provided eventName
     * This will keep 2 separate lists of event callbacks
     */
    VoxaApp.prototype.registerEvent = function (eventName) {
        var _this = this;
        this.eventHandlers[eventName] = [];
        this.eventHandlers["_" + eventName] = []; // we keep a separate list of event callbacks to alway execute them last
        if (!this[eventName]) {
            var capitalizedEventName = _.upperFirst(_.camelCase(eventName));
            this[eventName] = function (callback, atLast) {
                if (atLast) {
                    _this.eventHandlers["_" + eventName].push(callback.bind(_this));
                }
                else {
                    _this.eventHandlers[eventName].push(callback.bind(_this));
                }
            };
            this["get" + capitalizedEventName + "Handlers"] = function () { return _.concat(_this.eventHandlers[eventName], _this.eventHandlers["_" + eventName]); };
        }
    };
    VoxaApp.prototype.onState = function (stateName, handler, intents) {
        if (intents === void 0) { intents = []; }
        var state = _.get(this.states, stateName, { name: stateName });
        var stateEnter = _.get(state, "enter", {});
        if (_.isFunction(handler)) {
            if (intents.length === 0) {
                stateEnter.entry = handler;
            }
            else if (_.isString(intents)) {
                stateEnter[intents] = handler;
            }
            else if (_.isArray(intents)) {
                _.merge(stateEnter, _(intents)
                    .map(function (intentName) { return [intentName, handler]; })
                    .fromPairs()
                    .value());
            }
            state.enter = stateEnter;
            this.states[stateName] = state;
        }
        else {
            state.to = handler;
            this.states[stateName] = state;
        }
    };
    VoxaApp.prototype.onIntent = function (intentName, handler) {
        if (!this.states.entry) {
            this.states.entry = { to: {}, name: "entry" };
        }
        this.states.entry.to[intentName] = intentName;
        this.onState(intentName, handler);
    };
    VoxaApp.prototype.runStateMachine = function (voxaEvent, response) {
        return __awaiter(this, void 0, void 0, function () {
            var fromState, stateMachine, transition, onBeforeReplyHandlers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fromState = voxaEvent.session.new ? "entry" : _.get(voxaEvent, "session.attributes.model.state", "entry");
                        if (fromState === "die") {
                            fromState = "entry";
                        }
                        stateMachine = new StateMachine_1.StateMachine(fromState, {
                            onAfterStateChanged: this.getOnAfterStateChangedHandlers(),
                            onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(),
                            onUnhandledState: this.getOnUnhandledStateHandlers(),
                            states: this.states,
                        });
                        log("Starting the state machine from %s state", fromState);
                        return [4 /*yield*/, stateMachine.runTransition(voxaEvent, response)];
                    case 1:
                        transition = _a.sent();
                        if (!(!_.isString(transition.to) && _.get(transition, "to.isTerminal"))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleOnSessionEnded(voxaEvent, response)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        onBeforeReplyHandlers = this.getOnBeforeReplySentHandlers();
                        log("Running onBeforeReplySent");
                        return [4 /*yield*/, bluebird.mapSeries(onBeforeReplyHandlers, function (fn) { return fn(voxaEvent, response, transition); })];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    VoxaApp.prototype.renderDirectives = function (voxaEvent, response, transition) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var executeHandlers, pairs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        executeHandlers = function (key, value) { return __awaiter(_this, void 0, void 0, function () {
                            var handler;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        handler = _.find(this.directiveHandlers, { key: key });
                                        if (!handler) {
                                            return [2 /*return*/];
                                        }
                                        return [4 /*yield*/, handler.handler(value)(response, voxaEvent)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            });
                        }); };
                        pairs = _.toPairs(transition);
                        return [4 /*yield*/, bluebird.mapSeries(pairs, _.spread(executeHandlers))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, transition];
                }
            });
        });
    };
    VoxaApp.prototype.serializeModel = function (voxaEvent, response, transition) {
        return __awaiter(this, void 0, void 0, function () {
            var serialize, modelData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        serialize = _.get(voxaEvent, "model.serialize");
                        // we do require models to have a serialize method and check that when Voxa is initialized,
                        // however, developers could do stuff like `voxaEvent.model = null`,
                        // which seems natural if they want to
                        // clear the model
                        if (!serialize) {
                            voxaEvent.model = new this.config.Model();
                        }
                        if (!transition.to) {
                            throw new Error("Missing transition");
                        }
                        if (typeof transition.to === "string") {
                            voxaEvent.model.state = transition.to;
                        }
                        else if (StateMachine_1.isState(transition.to)) {
                            voxaEvent.model.state = transition.to.name;
                        }
                        return [4 /*yield*/, voxaEvent.model.serialize()];
                    case 1:
                        modelData = _a.sent();
                        voxaEvent.session.attributes.model = modelData;
                        return [2 /*return*/];
                }
            });
        });
    };
    VoxaApp.prototype.transformRequest = function (voxaEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var model;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.i18nextPromise];
                    case 1:
                        _a.sent();
                        if (!this.config.Model) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.config.Model.fromEvent(voxaEvent)];
                    case 2:
                        model = _a.sent();
                        voxaEvent.model = model;
                        _a.label = 3;
                    case 3:
                        voxaEvent.t = i18n.getFixedT(voxaEvent.request.locale);
                        log("Initialized model like %s", JSON.stringify(voxaEvent.model));
                        return [2 /*return*/];
                }
            });
        });
    };
    return VoxaApp;
}());
exports.VoxaApp = VoxaApp;
//# sourceMappingURL=VoxaApp.js.map