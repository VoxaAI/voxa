import * as bluebird from "bluebird";
import * as debug from "debug";
import * as i18n from "i18next";
import * as _ from "lodash";

import { ask, askP, directiveHandler, directives, reply, reprompt, say, sayP, tell, tellP } from "./directives";
import { OnSessionEndedError, UnknownRequestType } from "./errors";
import { IModel, Model } from "./Model";
import { IMessage, IRenderer, IRendererConfig, Renderer } from "./renderers/Renderer";
import { isState, IState, IStateMachineConfig, isTransition, ITransition, StateMachine } from "./StateMachine";
import { IVoxaEvent } from "./VoxaEvent";
import { IReply, VoxaReply } from "./VoxaReply";

const log: debug.IDebugger = debug("voxa");

export interface IVoxaAppConfig extends IRendererConfig {
  appIds?: string[]|string;
  Model?: IModel;
  RenderClass?: IRenderer;
  views: any;
  variables?: any;
}

export interface IDirectiveHandler {
  handler: (value: any) => directiveHandler;
  key?: string;
}

export type IEventHandler = (event: IVoxaEvent, response: VoxaReply, transition?: ITransition) => VoxaReply|void;
export type IErrorHandler = (event: IVoxaEvent, error: Error, ReplyClass: IReply<VoxaReply>) => VoxaReply;
export type IStateHandler = (event: IVoxaEvent) => ITransition;

export class VoxaApp {
  [x: string]: any;
  public eventHandlers: any;
  public requestHandlers: any;

  public config: any;
  public renderer: Renderer;
  public i18nextPromise: PromiseLike<i18n.TranslationFunction>;
  public states: any;
  public directiveHandlers: IDirectiveHandler[];

  constructor(config: IVoxaAppConfig) {
    this.config = config;
    this.eventHandlers = {};
    this.directiveHandlers = [];
    this.requestHandlers = {
      SessionEndedRequest: this.handleOnSessionEnded.bind(this),
    };

    _.forEach(this.requestTypes, (requestType) => this.registerRequestHandler(requestType));
    this.registerEvents();
    this.onError((voxaEvent: IVoxaEvent, error: Error, ReplyClass: IReply<VoxaReply>): VoxaReply => {
      console.error("onError");
      console.error(error);
      console.error(error.stack);
      const response =  new ReplyClass(voxaEvent, this.renderer);
      response.response.statements.push("An unrecoverable error occurred.");
      return response;
    }, true);

    this.states = {};
    this.config = _.assign({
      Model,
      RenderClass: Renderer,
    }, this.config);

    this.validateConfig();

    this.i18nextPromise = new Promise((resolve, reject) => {
      i18n.init({
        fallbackLng: "en",
        load: "all",
        nonExplicitWhitelist: true,
        resources: this.config.views,
      }, (err: Error, t: i18n.TranslationFunction) => {
        if (err) { return reject(err); }
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

    _.map([ask, askP, tell, tellP, say, sayP, reprompt, directives, reply],
      (handler: (value: any) => directiveHandler) => this.registerDirectiveHandler(handler, handler.name));
  }

  public registerDirectiveHandler(handler: (value: any) => directiveHandler, key?: string): void {
    this.directiveHandlers.push({ handler, key });
  }

  public validateConfig() {
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
  get requestTypes(): string[] { // eslint-disable-line class-methods-use-this
    return [
      "IntentRequest",
      "SessionEndedRequest",
    ];
  }

  public async handleOnSessionEnded(event: IVoxaEvent, response: VoxaReply): Promise<VoxaReply> {
    const sessionEndedHandlers = this.getOnSessionEndedHandlers(event.platform);
    const replies = await bluebird.mapSeries(sessionEndedHandlers, (fn: IEventHandler) => fn(event, response));
    const lastReply = _.last(replies);
    if (lastReply) {
      return lastReply;
    }

    return response;
  }

  /*
   * iterate on all error handlers and simply return the first one that
   * generates a reply
   */
  public async handleErrors(event: IVoxaEvent, error: Error, ReplyClass: IReply<VoxaReply>): Promise<VoxaReply> {
    const errorHandlers = this.getOnErrorHandlers(event.platform);
    const replies: VoxaReply[] = await bluebird.map(errorHandlers, async (errorHandler: IErrorHandler) => {
      return await errorHandler(event, error, ReplyClass);
    });
    let response: VoxaReply|undefined = _.find(replies);
    if (!response) {
      response = new ReplyClass(event, this.renderer);
    }

    response.error = error;
    return response;
  }

  // Call the specific request handlers for each request type
  public async execute(voxaEvent: IVoxaEvent, ReplyClass: IReply<VoxaReply>): Promise<any> {
    log("Received new event");
    log(JSON.stringify(voxaEvent, null, 2));
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
        throw new UnknownRequestType(voxaEvent.request.type);
      }

      const requestHandler = this.requestHandlers[voxaEvent.request.type];

      switch (voxaEvent.request.type) {
        case "IntentRequest":
        case "SessionEndedRequest": {
          // call all onRequestStarted callbacks serially.
          const result = await bluebird.mapSeries(this.getOnRequestStartedHandlers(voxaEvent.platform), (fn: IEventHandler) => {
            return fn(voxaEvent, response);
          });

          if (voxaEvent.request.type === "SessionEndedRequest" && _.get(voxaEvent, "request.reason") === "ERROR") {
            throw new OnSessionEndedError(_.get(voxaEvent, "request.error"));
          }

          // call all onSessionStarted callbacks serially.
          await bluebird.mapSeries(this.getOnSessionStartedHandlers(voxaEvent.platform), (fn: IEventHandler) => fn(voxaEvent, response));
          // Route the request to the proper handler which may have been overriden.
          return await requestHandler(voxaEvent, response);
        }

        default: {
          return await requestHandler(voxaEvent, response);
        }
      }
    } catch (error) {
      return await this.handleErrors(voxaEvent, error, ReplyClass);
    }
  }

  /*
   * Request handlers are in charge of responding to the different request types alexa sends,
   * in general they will defer to the proper event handler
   */
  public registerRequestHandler(requestType: string): void {
    // .filter(requestType => !this.requestHandlers[requestType])
    if (this.requestHandlers[requestType]) {
      return;
    }

    const eventName = `on${_.upperFirst(requestType)}`;
    this.registerEvent(eventName);

    this.requestHandlers[requestType] = async (voxaEvent: IVoxaEvent, response: VoxaReply): Promise<VoxaReply> => {
      log(eventName);
      const capitalizedEventName = _.upperFirst(_.camelCase(eventName));

      const runCallback = (fn: IEventHandler): VoxaReply => fn.call(this, voxaEvent, response);
      const result = await bluebird.mapSeries(this[`get${capitalizedEventName}Handlers`](), runCallback);

      // if the handlers produced a reply we return the last one
      const lastReply = _(result).filter().last();
      if (lastReply) {
        return lastReply;
      }

      // else we return the one we started with
      return response;
    };
  }

  /*
   * Event handlers are array of callbacks that get executed when an event is triggered
   * they can return a promise if async execution is needed,
   * most are registered with the voxaEvent handlers
   * however there are some that don't map exactly to a voxaEvent and we register them in here,
   * override the method to add new events.
   */
  public registerEvents(): void {
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
  public registerEvent(eventName: string): void {
    this.eventHandlers[eventName] = {
      core: [],
      coreLast: [], // we keep a separate list of event callbacks to alway execute them last
    };

    if (!this[eventName]) {
      const capitalizedEventName = _.upperFirst(_.camelCase(eventName));
      this[eventName] = (callback: IEventHandler, atLast: boolean = false, platform: string  = "core") => {
        if (atLast) {
          this.eventHandlers[eventName][`${platform}Last`] = this.eventHandlers[eventName][`${platform}Last`] || [];
          this.eventHandlers[eventName][`${platform}Last`].push(callback.bind(this));
        } else {
          this.eventHandlers[eventName][platform] = this.eventHandlers[eventName][platform] || [];
          this.eventHandlers[eventName][platform].push(callback.bind(this));
        }
      };

      this[`get${capitalizedEventName}Handlers`] = (platform?: string): IEventHandler[] => {
        let handlers: IEventHandler[];
        if (platform) {
          this.eventHandlers[eventName][platform] = this.eventHandlers[eventName][platform] || [];
          this.eventHandlers[eventName][`${platform}Last`] = this.eventHandlers[eventName][`${platform}Last`] || [];
          handlers = _.concat(
            this.eventHandlers[eventName].core,
            this.eventHandlers[eventName][platform],
            this.eventHandlers[eventName].coreLast,
            this.eventHandlers[eventName][`${platform}Last`],
          );
        } else {
          handlers = _.concat(
            this.eventHandlers[eventName].core,
            this.eventHandlers[eventName].coreLast,
          );
        }

        return handlers;
      };
    }
  }

  public onState(stateName: string, handler: IStateHandler | ITransition, intents: string[] | string = []): void {
    const state = _.get(this.states, stateName, { name: stateName });
    const stateEnter = _.get(state, "enter", {});

    if (_.isFunction(handler)) {
      if (intents.length === 0) {
        stateEnter.entry = handler;
      } else if (_.isString(intents)) {
        stateEnter[intents] = handler;
      } else if (_.isArray(intents)) {
        _.merge(stateEnter, _(intents)
          .map((intentName) => [intentName, handler])
          .fromPairs()
          .value());
      }
      state.enter = stateEnter;
      this.states[stateName] = state;
    } else {
      state.to = handler;
      this.states[stateName] = state;
    }
  }

  public onIntent(intentName: string, handler: IStateHandler|ITransition): void {
    if (!this.states.entry) {
      this.states.entry = { to: {}, name: "entry" };
    }
    this.states.entry.to[intentName] = intentName;
    this.onState(intentName, handler);
  }

  public async runStateMachine(voxaEvent: IVoxaEvent, response: VoxaReply): Promise<VoxaReply> {
    let fromState = voxaEvent.session.new ? "entry" : _.get(voxaEvent, "session.attributes.model.state", "entry");
    if (fromState === "die") {
      fromState = "entry";
    }
    const stateMachine = new StateMachine(fromState, {
      onAfterStateChanged: this.getOnAfterStateChangedHandlers(voxaEvent.platform),
      onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(voxaEvent.platform),
      onUnhandledState: this.getOnUnhandledStateHandlers(voxaEvent.platform),
      states: this.states,
    });

    log("Starting the state machine from %s state", fromState);

    const transition: ITransition = await stateMachine.runTransition(voxaEvent, response);
    if (!_.isString(transition.to) && _.get(transition, "to.isTerminal")) {
      await this.handleOnSessionEnded(voxaEvent, response);
    }

    const onBeforeReplyHandlers = this.getOnBeforeReplySentHandlers(voxaEvent.platform);
    log("Running onBeforeReplySent");
    await bluebird.mapSeries(onBeforeReplyHandlers, (fn: IEventHandler) => fn(voxaEvent, response, transition));

    return response;
  }

  public async renderDirectives(voxaEvent: IVoxaEvent, response: VoxaReply, transition: ITransition): Promise<ITransition> {
    const executeHandlers = async (key: string, value: any ) => {
      const handler = _.find(this.directiveHandlers, { key });
      if (!handler) {
        return;
      }

      return await handler.handler(value)(response, voxaEvent);
    };

    const pairs = _.toPairs(transition);
    await bluebird.mapSeries(pairs, _.spread(executeHandlers));
    return transition;
  }

  public async serializeModel(voxaEvent: IVoxaEvent, response: VoxaReply, transition: ITransition): Promise<void > {
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
    } else if (isState(transition.to)) {
      voxaEvent.model.state = transition.to.name;
    }

    const modelData = await voxaEvent.model.serialize();
    voxaEvent.session.attributes.model = modelData;
  }

  public async transformRequest(voxaEvent: IVoxaEvent): Promise<void> {
    await this.i18nextPromise;
    if (this.config.Model) {
      const model: Model = await this.config.Model.fromEvent(voxaEvent);
      voxaEvent.model = model;
    }
    voxaEvent.t = i18n.getFixedT(voxaEvent.request.locale);
    log("Initialized model like %s", JSON.stringify(voxaEvent.model));
  }
}
