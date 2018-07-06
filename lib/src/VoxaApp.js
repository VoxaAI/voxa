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
const i18n = require("i18next");
const _ = require("lodash");
const directives_1 = require("./directives");
const errors_1 = require("./errors");
const Model_1 = require("./Model");
const Renderer_1 = require("./renderers/Renderer");
const StateMachine_1 = require("./StateMachine");
const log = debug("voxa");
class VoxaApp {
    constructor(config) {
        this.i18n = i18n.createInstance();
        this.config = config;
        this.eventHandlers = {};
        this.directiveHandlers = [];
        this.requestHandlers = {
            SessionEndedRequest: this.handleOnSessionEnded.bind(this),
        };
        _.forEach(this.requestTypes, (requestType) => this.registerRequestHandler(requestType));
        this.registerEvents();
        this.onError((voxaEvent, error, reply) => {
            console.error("onError");
            console.error(error.message ? error.message : error);
            console.trace();
            log(error);
            reply.clear();
            reply.addStatement("An unrecoverable error occurred.");
            reply.terminate();
            return reply;
        }, true);
        this.states = {
            core: {},
        };
        this.config = _.assign({
            Model: Model_1.Model,
            RenderClass: Renderer_1.Renderer,
        }, this.config);
        this.validateConfig();
        this.i18nextPromise = new Promise((resolve, reject) => {
            this.i18n.init({
                fallbackLng: "en",
                load: "all",
                nonExplicitWhitelist: true,
                resources: this.config.views,
            }, (err, t) => {
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
        this.onBeforeReplySent(this.serializeModel, true);
        this.directiveHandlers = [directives_1.Say, directives_1.SayP, directives_1.Ask, directives_1.Reprompt, directives_1.Tell];
    }
    validateConfig() {
        if (!this.config.Model.fromEvent) {
            throw new Error("Model should have a fromEvent method");
        }
        if (!this.config.Model.serialize && !(this.config.Model.prototype && this.config.Model.prototype.serialize)) {
            throw new Error("Model should have a serialize method");
        }
    }
    /*
     * This way we can simply override the method if we want different request types
     */
    get requestTypes() {
        return [
            "IntentRequest",
            "SessionEndedRequest",
        ];
    }
    handleOnSessionEnded(event, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionEndedHandlers = this.getOnSessionEndedHandlers(event.platform);
            const replies = yield bluebird.mapSeries(sessionEndedHandlers, (fn) => fn(event, response));
            const lastReply = _.last(replies);
            if (lastReply) {
                return lastReply;
            }
            return response;
        });
    }
    /*
     * iterate on all error handlers and simply return the first one that
     * generates a reply
     */
    handleErrors(event, error, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            const errorHandlers = this.getOnErrorHandlers(event.platform);
            const replies = yield bluebird.map(errorHandlers, (errorHandler) => __awaiter(this, void 0, void 0, function* () {
                return yield errorHandler(event, error, reply);
            }));
            let response = _.find(replies);
            if (!response) {
                reply.clear();
                response = reply;
            }
            return response;
        });
    }
    // Call the specific request handlers for each request type
    execute(voxaEvent, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Received new event", JSON.stringify(voxaEvent.rawEvent, null, 2));
            try {
                // Validate that this AlexaRequest originated from authorized source.
                if (this.config.appIds) {
                    const appId = voxaEvent.context.application.applicationId;
                    if (_.isString(this.config.appIds) && this.config.appIds !== appId) {
                        log(`The applicationIds don't match: "${appId}"  and  "${this.config.appIds}"`);
                        throw new Error("Invalid applicationId");
                    }
                    if (_.isArray(this.config.appIds) && !_.includes(this.config.appIds, appId)) {
                        log(`The applicationIds don't match: "${appId}"  and  "${this.config.appIds}"`);
                        throw new Error("Invalid applicationId");
                    }
                }
                if (!this.requestHandlers[voxaEvent.request.type]) {
                    throw new errors_1.UnknownRequestType(voxaEvent.request.type);
                }
                const requestHandler = this.requestHandlers[voxaEvent.request.type];
                const executeHandlers = () => __awaiter(this, void 0, void 0, function* () {
                    switch (voxaEvent.request.type) {
                        case "IntentRequest":
                        case "SessionEndedRequest": {
                            // call all onRequestStarted callbacks serially.
                            const result = yield bluebird.mapSeries(this.getOnRequestStartedHandlers(voxaEvent.platform), (fn) => {
                                return fn(voxaEvent, reply);
                            });
                            if (voxaEvent.request.type === "SessionEndedRequest" && _.get(voxaEvent, "request.reason") === "ERROR") {
                                throw new errors_1.OnSessionEndedError(_.get(voxaEvent, "request.error"));
                            }
                            // call all onSessionStarted callbacks serially.
                            yield bluebird.mapSeries(this.getOnSessionStartedHandlers(voxaEvent.platform), (fn) => fn(voxaEvent, reply));
                            // Route the request to the proper handler which may have been overriden.
                            return yield requestHandler(voxaEvent, reply);
                        }
                        default: {
                            return yield requestHandler(voxaEvent, reply);
                        }
                    }
                });
                const promises = [];
                const context = voxaEvent.executionContext;
                if (isLambdaContext(context)) {
                    promises.push(timeout(context));
                }
                promises.push(executeHandlers());
                return yield bluebird.race(promises);
            }
            catch (error) {
                return yield this.handleErrors(voxaEvent, error, reply);
            }
        });
    }
    /*
     * Request handlers are in charge of responding to the different request types alexa sends,
     * in general they will defer to the proper event handler
     */
    registerRequestHandler(requestType) {
        // .filter(requestType => !this.requestHandlers[requestType])
        if (this.requestHandlers[requestType]) {
            return;
        }
        const eventName = `on${_.upperFirst(requestType)}`;
        this.registerEvent(eventName);
        this.requestHandlers[requestType] = (voxaEvent, response) => __awaiter(this, void 0, void 0, function* () {
            log(eventName);
            const capitalizedEventName = _.upperFirst(_.camelCase(eventName));
            const runCallback = (fn) => fn.call(this, voxaEvent, response);
            const result = yield bluebird.mapSeries(this[`get${capitalizedEventName}Handlers`](), runCallback);
            // if the handlers produced a reply we return the last one
            const lastReply = _(result).filter().last();
            if (lastReply) {
                return lastReply;
            }
            // else we return the one we started with
            return response;
        });
    }
    /*
     * Event handlers are array of callbacks that get executed when an event is triggered
     * they can return a promise if async execution is needed,
     * most are registered with the voxaEvent handlers
     * however there are some that don't map exactly to a voxaEvent and we register them in here,
     * override the method to add new events.
     */
    registerEvents() {
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
    }
    /*
     * Create an event handler register for the provided eventName
     * This will keep 2 separate lists of event callbacks
     */
    registerEvent(eventName) {
        this.eventHandlers[eventName] = {
            core: [],
            coreLast: [],
        };
        if (!this[eventName]) {
            const capitalizedEventName = _.upperFirst(_.camelCase(eventName));
            this[eventName] = (callback, atLast = false, platform = "core") => {
                if (atLast) {
                    this.eventHandlers[eventName][`${platform}Last`] = this.eventHandlers[eventName][`${platform}Last`] || [];
                    this.eventHandlers[eventName][`${platform}Last`].push(callback.bind(this));
                }
                else {
                    this.eventHandlers[eventName][platform] = this.eventHandlers[eventName][platform] || [];
                    this.eventHandlers[eventName][platform].push(callback.bind(this));
                }
            };
            this[`get${capitalizedEventName}Handlers`] = (platform) => {
                let handlers;
                if (platform) {
                    this.eventHandlers[eventName][platform] = this.eventHandlers[eventName][platform] || [];
                    this.eventHandlers[eventName][`${platform}Last`] = this.eventHandlers[eventName][`${platform}Last`] || [];
                    handlers = _.concat(this.eventHandlers[eventName].core, this.eventHandlers[eventName][platform], this.eventHandlers[eventName].coreLast, this.eventHandlers[eventName][`${platform}Last`]);
                }
                else {
                    handlers = _.concat(this.eventHandlers[eventName].core, this.eventHandlers[eventName].coreLast);
                }
                return handlers;
            };
        }
    }
    onState(stateName, handler, intents = [], platform = "core") {
        const state = _.get(this.states[platform], stateName, { name: stateName });
        const stateEnter = _.get(state, "enter", {});
        if (_.isFunction(handler)) {
            if (intents.length === 0) {
                stateEnter.entry = handler;
            }
            else if (_.isString(intents)) {
                stateEnter[intents] = handler;
            }
            else if (_.isArray(intents)) {
                _.merge(stateEnter, _(intents)
                    .map((intentName) => [intentName, handler])
                    .fromPairs()
                    .value());
            }
            state.enter = stateEnter;
            _.set(this.states, [platform, stateName], state);
        }
        else {
            state.to = handler;
            _.set(this.states, [platform, stateName], state);
        }
    }
    onIntent(intentName, handler, platform = "core") {
        if (!_.get(this.states, [platform, "entry"])) {
            _.set(this.states, [platform, "entry"], { to: {}, name: "entry" });
        }
        this.states[platform].entry.to[intentName] = intentName;
        this.onState(intentName, handler, [], platform);
    }
    runStateMachine(voxaEvent, response) {
        return __awaiter(this, void 0, void 0, function* () {
            let fromState = voxaEvent.session.new ? "entry" : _.get(voxaEvent, "session.attributes.state", "entry");
            if (fromState === "die") {
                fromState = "entry";
            }
            const stateMachine = new StateMachine_1.StateMachine({
                onAfterStateChanged: this.getOnAfterStateChangedHandlers(voxaEvent.platform),
                onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(voxaEvent.platform),
                onUnhandledState: this.getOnUnhandledStateHandlers(voxaEvent.platform),
                states: this.states,
            });
            log("Starting the state machine from %s state", fromState);
            const transition = yield stateMachine.runTransition(fromState, voxaEvent, response);
            if (!_.isString(transition.to) && _.get(transition, "to.isTerminal")) {
                yield this.handleOnSessionEnded(voxaEvent, response);
            }
            const onBeforeReplyHandlers = this.getOnBeforeReplySentHandlers(voxaEvent.platform);
            log("Running onBeforeReplySent");
            yield bluebird.mapSeries(onBeforeReplyHandlers, (fn) => fn(voxaEvent, response, transition));
            return response;
        });
    }
    renderDirectives(voxaEvent, response, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const directives = _.concat(_.filter(this.directiveHandlers, { platform: "core" }), _.filter(this.directiveHandlers, { platform: voxaEvent.platform }));
            const directivesKeyOrder = _.map(directives, "key");
            const pairs = _(transition)
                .toPairs()
                .sortBy((pair) => {
                const [key, value] = pair;
                return _.indexOf(directivesKeyOrder, key);
            })
                .value();
            while (pairs.length) {
                const pair = pairs.shift();
                if (!pair) {
                    continue;
                }
                const [key, value] = pair;
                const handlers = _.filter(directives, { key });
                if (!handlers.length) {
                    continue;
                }
                for (const handler of handlers) {
                    yield new handler(value).writeToReply(response, voxaEvent, transition);
                }
            }
            if (transition.directives) {
                if (_.isString(transition.directives)) {
                    transition.directives = yield voxaEvent.renderer.renderPath(transition.directives, voxaEvent);
                }
                if (!transition.directives) {
                    return transition;
                }
                if (!_.isArray(transition.directives)) {
                    transition.directives = [transition.directives];
                }
                transition.directives = _.concat(_.filter(transition.directives, (directive) => directive.constructor.platform === "core"), _.filter(transition.directives, (directive) => directive.constructor.platform === voxaEvent.platform));
                for (const handler of transition.directives) {
                    return yield handler.writeToReply(response, voxaEvent, transition);
                }
            }
            return transition;
        });
    }
    serializeModel(voxaEvent, response, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const serialize = _.get(voxaEvent, "model.serialize");
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
            yield response.saveSession(voxaEvent);
        });
    }
    transformRequest(voxaEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.i18nextPromise;
            let model;
            if (this.config.Model) {
                model = yield this.config.Model.fromEvent(voxaEvent);
            }
            else {
                model = yield Model_1.Model.fromEvent(voxaEvent);
            }
            voxaEvent.model = model;
            log("Initialized model like %s", JSON.stringify(voxaEvent.model));
            voxaEvent.t = this.i18n.getFixedT(voxaEvent.request.locale);
            voxaEvent.renderer = this.renderer;
        });
    }
}
exports.VoxaApp = VoxaApp;
function timeout(context) {
    return __awaiter(this, void 0, void 0, function* () {
        const timeRemaining = context.getRemainingTimeInMillis();
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(new errors_1.TimeoutError());
            }, Math.max(timeRemaining - 500, 0));
        });
    });
}
exports.timeout = timeout;
function isLambdaContext(context) {
    if (!context) {
        return false;
    }
    return context.getRemainingTimeInMillis !== undefined;
}
//# sourceMappingURL=VoxaApp.js.map