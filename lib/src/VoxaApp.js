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
        this.config = config;
        this.eventHandlers = {};
        this.directiveHandlers = [];
        this.requestHandlers = {
            SessionEndedRequest: this.handleOnSessionEnded.bind(this),
        };
        _.forEach(this.requestTypes, (requestType) => this.registerRequestHandler(requestType));
        this.registerEvents();
        this.onError((voxaEvent, error, ReplyClass) => {
            log("onError %s", error);
            log(error.stack);
            const response = new ReplyClass(voxaEvent, this.renderer);
            response.response.statements.push("An unrecoverable error occurred.");
            return response;
        }, true);
        this.states = {};
        this.config = _.assign({
            Model: Model_1.Model,
            RenderClass: Renderer_1.Renderer,
        }, this.config);
        this.validateConfig();
        this.i18nextPromise = new Promise((resolve, reject) => {
            i18n.init({
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
        this.onBeforeReplySent(this.serializeModel);
        _.map([directives_1.ask, directives_1.askP, directives_1.tell, directives_1.tellP, directives_1.say, directives_1.sayP, directives_1.reprompt, directives_1.directives, directives_1.reply], (handler) => this.registerDirectiveHandler(handler, handler.name));
    }
    registerDirectiveHandler(handler, key) {
        this.directiveHandlers.push({ handler, key });
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
    handleOnSessionEnded(voxaEvent, response) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionEndedHandlers = this.getOnSessionEndedHandlers();
            const replies = yield bluebird.mapSeries(sessionEndedHandlers, (fn) => fn(voxaEvent, response));
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
    handleErrors(event, error, ReplyClass) {
        return __awaiter(this, void 0, void 0, function* () {
            const errorHandlers = this.getOnErrorHandlers();
            const replies = yield bluebird.map(errorHandlers, mapper);
            let response = _.find(replies);
            if (!response) {
                response = new ReplyClass(event, this.renderer);
            }
            response.error = error;
            return response;
            function mapper(errorHandler) {
                return __awaiter(this, void 0, void 0, function* () {
                    return yield errorHandler(event, error, ReplyClass);
                });
            }
        });
    }
    // Call the specific request handlers for each request type
    execute(voxaEvent, ReplyClass) {
        return __awaiter(this, void 0, void 0, function* () {
            log("Received new event");
            log(voxaEvent);
            try {
                const response = new ReplyClass(voxaEvent, this.renderer);
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
                switch (voxaEvent.request.type) {
                    case "IntentRequest":
                    case "SessionEndedRequest": {
                        // call all onRequestStarted callbacks serially.
                        const result = yield bluebird.mapSeries(this.getOnRequestStartedHandlers(), mapper);
                        function mapper(fn) {
                            return fn(voxaEvent, response);
                        }
                        if (voxaEvent.request.type === "SessionEndedRequest" && _.get(voxaEvent, "request.reason") === "ERROR") {
                            throw new errors_1.OnSessionEndedError(_.get(voxaEvent, "request.error"));
                        }
                        // call all onSessionStarted callbacks serially.
                        yield bluebird.mapSeries(this.getOnSessionStartedHandlers(), (fn) => fn(voxaEvent, response));
                        // Route the request to the proper handler which may have been overriden.
                        return yield requestHandler(voxaEvent, response);
                    }
                    default: {
                        return yield requestHandler(voxaEvent, response);
                    }
                }
            }
            catch (error) {
                return yield this.handleErrors(voxaEvent, error, ReplyClass);
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
        const eventName = `on${requestType}`;
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
        this.eventHandlers[eventName] = [];
        this.eventHandlers[`_${eventName}`] = []; // we keep a separate list of event callbacks to alway execute them last
        if (!this[eventName]) {
            const capitalizedEventName = _.upperFirst(_.camelCase(eventName));
            this[eventName] = (callback, atLast) => {
                if (atLast) {
                    this.eventHandlers[`_${eventName}`].push(callback.bind(this));
                }
                else {
                    this.eventHandlers[eventName].push(callback.bind(this));
                }
            };
            this[`get${capitalizedEventName}Handlers`] = () => _.concat(this.eventHandlers[eventName], this.eventHandlers[`_${eventName}`]);
        }
    }
    onState(stateName, handler, intents = []) {
        const state = _.get(this.states, stateName, { name: stateName });
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
            this.states[stateName] = state;
        }
        else {
            state.to = handler;
            this.states[stateName] = state;
        }
    }
    onIntent(intentName, handler) {
        if (!this.states.entry) {
            this.states.entry = { to: {}, name: "entry" };
        }
        this.states.entry.to[intentName] = intentName;
        this.onState(intentName, handler);
    }
    runStateMachine(voxaEvent, response) {
        return __awaiter(this, void 0, void 0, function* () {
            let fromState = voxaEvent.session.new ? "entry" : _.get(voxaEvent, "session.attributes.model._state", "entry");
            if (fromState === "die") {
                fromState = "entry";
            }
            const stateMachine = new StateMachine_1.StateMachine(fromState, {
                onAfterStateChanged: this.getOnAfterStateChangedHandlers(),
                onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(),
                onUnhandledState: this.getOnUnhandledStateHandlers(),
                states: this.states,
            });
            log("Starting the state machine from %s state", fromState);
            const transition = yield stateMachine.runTransition(voxaEvent, response);
            if (!_.isString(transition.to) && _.get(transition, "to.isTerminal")) {
                yield this.handleOnSessionEnded(voxaEvent, response);
            }
            const onBeforeReplyHandlers = this.getOnBeforeReplySentHandlers();
            log("Running onBeforeReplySent");
            yield bluebird.mapSeries(onBeforeReplyHandlers, (fn) => fn(voxaEvent, response, transition));
            return response;
        });
    }
    renderDirectives(voxaEvent, response, transition) {
        return __awaiter(this, void 0, void 0, function* () {
            const executeHandlers = (key, value) => __awaiter(this, void 0, void 0, function* () {
                const handler = _.find(this.directiveHandlers, { key });
                if (!handler) {
                    return;
                }
                return yield handler.handler(value)(response, voxaEvent);
            });
            const pairs = _.toPairs(transition);
            yield bluebird.mapSeries(pairs, _.spread(executeHandlers));
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
            const modelData = yield voxaEvent.model.serialize();
            voxaEvent.session.attributes.model = modelData;
        });
    }
    transformRequest(voxaEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.i18nextPromise;
            if (this.config.Model) {
                const model = yield this.config.Model.fromEvent(voxaEvent);
                voxaEvent.model = model;
            }
            voxaEvent.t = i18n.getFixedT(voxaEvent.request.locale);
            log("Initialized model like %s", JSON.stringify(voxaEvent.model));
        });
    }
}
exports.VoxaApp = VoxaApp;
//# sourceMappingURL=VoxaApp.js.map