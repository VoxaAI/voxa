/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as bluebird from "bluebird";
import * as i18next from "i18next";
import * as _ from "lodash";

import { Context as AWSLambdaContext } from "aws-lambda";
import { LambdaLogOptions } from "lambda-log";
import {
  Ask,
  IDirective,
  IDirectiveClass,
  Reprompt,
  Say,
  SayP,
  Tell,
  Text,
  TextP,
} from "./directives";
import { errorHandler, UnknownRequestType } from "./errors";
import { isLambdaContext, timeout } from "./lambda";
import { IModel, Model } from "./Model";
import { IRenderer, IRendererConfig, Renderer } from "./renderers/Renderer";
import {
  IStateHandler,
  ITransition,
  IUnhandledStateCb,
  State,
  StateMachine,
  SystemTransition,
} from "./StateMachine";
import { IBag, IVoxaEvent, IVoxaIntentEvent } from "./VoxaEvent";
import { IVoxaReply } from "./VoxaReply";

const i18n: i18next.i18n = require("i18next");

export interface IVoxaAppConfig extends IRendererConfig {
  Model: IModel;
  RenderClass: IRenderer;
  views: i18next.Resource;
  variables?: any;
  logOptions?: LambdaLogOptions;
  onUnhandledState?: IUnhandledStateCb;
}

export type IEventHandler = (
  event: IVoxaEvent,
  response: IVoxaReply,
  transition?: ITransition,
) => IVoxaReply | void;

export type IErrorHandler = (
  event: IVoxaEvent,
  error: Error,
  ReplyClass: IVoxaReply,
) => IVoxaReply;

export class VoxaApp {
  [key: string]: any;

  /*
   * This way we can simply override the method if we want different request types
   */
  get requestTypes(): string[] {
    // eslint-disable-line class-methods-use-this
    return ["IntentRequest", "SessionEndedRequest"];
  }
  public eventHandlers: any = {};
  public requestHandlers: any;

  public config: IVoxaAppConfig;
  public renderer: Renderer;
  public i18nextPromise: PromiseLike<i18next.TFunction>;

  // WARNING: the i18n variable should remain as a local instance of the VoxaApp.ts
  // class, so that its internal configuration is initialized with every Voxa's request.
  // This ensures its configuration is tied to the locale the request is coming with.
  // For instance, if a skill has en-US and de-DE locales. There could be an issue
  // with the global instance of i18n to return english values to the German locale.
  public i18n: i18next.i18n;
  public states: State[] = [];
  public directiveHandlers: IDirectiveClass[] = [];

  constructor(config: any) {
    this.i18n = i18n.createInstance();
    this.config = config;
    this.requestHandlers = {
      SessionEndedRequest: this.handleOnSessionEnded.bind(this),
    };

    _.forEach(this.requestTypes, (requestType) =>
      this.registerRequestHandler(requestType),
    );
    this.registerEvents();
    this.onError(errorHandler, true);
    this.config = _.assign(
      {
        Model,
        RenderClass: Renderer,
      },
      this.config,
    );

    this.validateConfig();

    this.i18nextPromise = initializeI118n(this.i18n, this.config.views);
    this.renderer = new this.config.RenderClass(this.config);

    // this can be used to plug new information in the request
    // default is to just initialize the model
    this.onRequestStarted(this.transformRequest);

    // run the state machine for intentRequests
    this.onIntentRequest(this.runStateMachine, true);

    this.onAfterStateChanged(this.renderDirectives);
    this.onBeforeReplySent(this.saveSession, true);

    this.directiveHandlers = [Say, SayP, Ask, Reprompt, Tell, Text, TextP];
  }

  public validateConfig() {
    if (!this.config.Model.deserialize) {
      throw new Error("Model should have a deserialize method");
    }

    if (
      !this.config.Model.serialize &&
      !(this.config.Model.prototype && this.config.Model.prototype.serialize)
    ) {
      throw new Error("Model should have a serialize method");
    }
  }

  public async handleOnSessionEnded(
    event: IVoxaIntentEvent,
    response: IVoxaReply,
  ): Promise<IVoxaReply> {
    const sessionEndedHandlers = this.getOnSessionEndedHandlers(
      event.platform.name,
    );
    const replies = await bluebird.mapSeries(
      sessionEndedHandlers,
      (fn: IEventHandler) => fn(event, response),
    );
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
  public async handleErrors(
    event: IVoxaEvent,
    error: Error,
    reply: IVoxaReply,
  ): Promise<IVoxaReply> {
    const errorHandlers = this.getOnErrorHandlers(event.platform.name);
    const replies: IVoxaReply[] = await bluebird.map(
      errorHandlers,
      async (handler: IErrorHandler) => {
        return await handler(event, error, reply);
      },
    );
    let response: IVoxaReply | undefined = _.find(replies);
    if (!response) {
      reply.clear();
      response = reply;
    }

    return response;
  }

  // Call the specific request handlers for each request type
  public async execute(
    voxaEvent: IVoxaEvent,
    reply: IVoxaReply,
  ): Promise<IVoxaReply> {
    voxaEvent.log.debug("Received new event", { event: voxaEvent.rawEvent });

    try {
      if (!this.requestHandlers[voxaEvent.request.type]) {
        throw new UnknownRequestType(voxaEvent.request.type);
      }

      const requestHandler = this.requestHandlers[voxaEvent.request.type];
      const executeHandlers = async () => {
        switch (voxaEvent.request.type) {
          case "IntentRequest":
          case "SessionEndedRequest": {
            // call all onRequestStarted callbacks serially.
            await bluebird.mapSeries(
              this.getOnRequestStartedHandlers(voxaEvent.platform.name),
              (fn: IEventHandler) => {
                return fn(voxaEvent, reply);
              },
            );

            if (voxaEvent.session.new) {
              // call all onSessionStarted callbacks serially.
              await bluebird.mapSeries(
                this.getOnSessionStartedHandlers(voxaEvent.platform.name),
                (fn: IEventHandler) => fn(voxaEvent, reply),
              );
            }
            // Route the request to the proper handler which may have been overriden.
            return await requestHandler(voxaEvent, reply);
          }

          default: {
            return await requestHandler(voxaEvent, reply);
          }
        }
      };

      let response: IVoxaReply;
      const context = voxaEvent.executionContext;

      if (isLambdaContext(context)) {
        const promises = [];
        const { timer, timerPromise } = timeout(context);
        promises.push(timerPromise);
        promises.push(executeHandlers());

        response = await bluebird.race(promises);
        if (timer) {
          clearTimeout(timer);
        }
      } else {
        response = await executeHandlers();
      }

      return response;
    } catch (error) {
      return this.handleErrors(voxaEvent, error, reply);
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

    this.requestHandlers[requestType] = async (
      voxaEvent: IVoxaEvent,
      response: IVoxaReply,
    ): Promise<IVoxaReply> => {
      const capitalizedEventName = _.upperFirst(_.camelCase(eventName));

      const runCallback = (fn: IEventHandler): IVoxaReply | void =>
        fn.call(this, voxaEvent, response);
      const result = await bluebird.mapSeries(
        this[`get${capitalizedEventName}Handlers`](),
        runCallback,
      );

      // if the handlers produced a reply we return the last one
      const lastReply = _(result)
        .filter()
        .last();
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
  }

  public onUnhandledState(fn: IUnhandledStateCb) {
    this.config.onUnhandledState = fn;
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
      this[eventName] = (
        callback: IEventHandler,
        atLast: boolean = false,
        platform: string = "core",
      ) => {
        if (atLast) {
          this.eventHandlers[eventName][`${platform}Last`] =
            this.eventHandlers[eventName][`${platform}Last`] || [];
          this.eventHandlers[eventName][`${platform}Last`].push(
            callback.bind(this),
          );
        } else {
          this.eventHandlers[eventName][platform] =
            this.eventHandlers[eventName][platform] || [];
          this.eventHandlers[eventName][platform].push(callback.bind(this));
        }
      };

      this[`get${capitalizedEventName}Handlers`] = (
        platform?: string,
      ): IEventHandler[] => {
        let handlers: IEventHandler[];
        if (platform) {
          this.eventHandlers[eventName][platform] =
            this.eventHandlers[eventName][platform] || [];
          this.eventHandlers[eventName][`${platform}Last`] =
            this.eventHandlers[eventName][`${platform}Last`] || [];
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

  public onState(
    stateName: string,
    handler: IStateHandler | ITransition,
    intents: string[] | string = [],
    platform: string = "core",
  ): void {
    const state = new State(stateName, handler, intents, platform);
    this.states.push(state);
  }

  public onIntent(
    intentName: string,
    handler: IStateHandler | ITransition,
    platform: string = "core",
  ): void {
    this.onState(intentName, handler, intentName, platform);
  }

  public async runStateMachine(
    voxaEvent: IVoxaIntentEvent,
    response: IVoxaReply,
  ): Promise<IVoxaReply> {
    let fromState = voxaEvent.session.new
      ? "entry"
      : _.get(voxaEvent, "session.attributes.state", "entry");
    if (fromState === "die") {
      fromState = "entry";
    }

    const stateMachine = new StateMachine({
      onAfterStateChanged: this.getOnAfterStateChangedHandlers(
        voxaEvent.platform.name,
      ),
      onBeforeStateChanged: this.getOnBeforeStateChangedHandlers(
        voxaEvent.platform.name,
      ),
      onUnhandledState: this.config.onUnhandledState,
      states: this.states,
    });

    voxaEvent.log.debug("Starting the state machine", { fromState });

    const transition = await stateMachine.runTransition(
      fromState,
      voxaEvent,
      response,
    );

    if (transition.shouldTerminate) {
      await this.handleOnSessionEnded(voxaEvent, response);
    }

    const onBeforeReplyHandlers = this.getOnBeforeReplySentHandlers(
      voxaEvent.platform.name,
    );

    voxaEvent.log.debug("Running onBeforeReplySent");
    await bluebird.mapSeries(onBeforeReplyHandlers, (fn: IEventHandler) =>
      fn(voxaEvent, response, transition),
    );

    return response;
  }

  public async renderDirectives(
    voxaEvent: IVoxaEvent,
    response: IVoxaReply,
    transition: SystemTransition,
  ): Promise<ITransition> {
    const directiveClasses: IDirectiveClass[] = _.concat(
      _.filter(this.directiveHandlers, { platform: "core" }),
      _.filter(this.directiveHandlers, { platform: voxaEvent.platform.name }),
    );

    const directivesKeyOrder = _.map(directiveClasses, "key");
    if (transition.reply) {
      const replyTransition = await this.getReplyTransitions(
        voxaEvent,
        transition,
      );
      transition = _.merge(transition, replyTransition);
    }

    const directives: IDirective[] = _(transition)
      .toPairs()
      .sortBy((pair: any[]) => {
        const [key, value] = pair;
        return _.indexOf(directivesKeyOrder, key);
      })
      .map(_.spread(instantiateDirectives))
      .flatten()
      .concat(transition.directives || [])
      .filter()
      .filter((directive: IDirective): boolean => {
        const constructor: any = directive.constructor;
        return _.includes(
          ["core", voxaEvent.platform.name],
          constructor.platform,
        );
      })
      .value();

    for (const handler of directives) {
      await handler.writeToReply(response, voxaEvent, transition);
    }

    return transition;

    function instantiateDirectives(key: string, value: any): IDirective[] {
      let handlers: IDirectiveClass[] = _.filter(
        directiveClasses,
        (classObject: IDirectiveClass) => classObject.key === key,
      );

      if (handlers.length > 1) {
        handlers = _.filter(
          handlers,
          (handler: IDirectiveClass) =>
            handler.platform === voxaEvent.platform.name,
        );
      }

      return _.map(
        handlers,
        (Directive: IDirectiveClass) => new Directive(value),
      ) as IDirective[];
    }
  }

  public async saveSession(
    voxaEvent: IVoxaEvent,
    response: IVoxaReply,
    transition: ITransition,
  ): Promise<void> {
    const serialize = _.get(voxaEvent, "model.serialize");

    // we do require models to have a serialize method and check that when Voxa is initialized,
    // however, developers could do stuff like `voxaEvent.model = null`,
    // which seems natural if they want to
    // clear the model
    if (!serialize) {
      voxaEvent.model = new this.config.Model();
    }

    const stateName = transition.to;

    // We save off the state so that we know where to resume from when the conversation resumes
    const modelData = await voxaEvent.model.serialize();
    const attributes = {
      ...voxaEvent.session.outputAttributes,
      model: modelData,
      state: stateName,
    };

    await response.saveSession(attributes, voxaEvent);
  }

  public async transformRequest(voxaEvent: IVoxaEvent): Promise<void> {
    await this.i18nextPromise;
    const data = voxaEvent.session.attributes.model as IBag;
    const model = await this.config.Model.deserialize(data, voxaEvent);

    voxaEvent.model = model;
    voxaEvent.log.debug("Initialized model ", { model: voxaEvent.model });
    voxaEvent.t = this.i18n.getFixedT(voxaEvent.request.locale);
    voxaEvent.renderer = this.renderer;
  }

  private async getReplyTransitions(
    voxaEvent: IVoxaEvent,
    transition: ITransition,
  ): Promise<ITransition> {
    if (!transition.reply) {
      return {};
    }
    let finalReply = {};

    let replies = [];
    if (_.isArray(transition.reply)) {
      replies = transition.reply;
    } else {
      replies = [transition.reply];
    }

    for (const replyItem of replies) {
      const reply = await voxaEvent.renderer.renderPath(replyItem, voxaEvent);
      const replyKeys = _.keys(reply);
      const replyData = _(replyKeys)
        .map((key) => {
          return [key, replyItem + "." + key];
        })
        .fromPairs()
        .value();

      finalReply = _.mergeWith(finalReply, replyData, function customizer(
        objValue,
        srcValue,
      ) {
        if (!objValue) {
          return; // use default merge behavior
        }

        if (_.isArray(objValue)) {
          return objValue.concat(srcValue);
        }

        return [objValue, srcValue];
      });
    }

    return finalReply;
  }
}

export function initializeI118n(
  i18nInstance: i18next.i18n,
  views: i18next.Resource,
): bluebird<i18next.TFunction> {
  type IInitializer = (
    options: i18next.InitOptions,
  ) => bluebird<i18next.TFunction>;

  const initialize = bluebird.promisify(i18nInstance.init, {
    context: i18nInstance,
  }) as IInitializer;

  return initialize({
    fallbackLng: "en",
    load: "all",
    nonExplicitWhitelist: true,
    resources: views,
  });
}
