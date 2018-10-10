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
import * as _ from "lodash";

import { UnhandledState, UnknownState } from "../errors";
import { IVoxaIntent, IVoxaIntentEvent } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";
import {
  isState,
  IState,
  isTransition,
  ITransition,
  SystemTransition,
} from "./transitions";

export type IStateMachineCb = (
  event: IVoxaIntentEvent,
  reply: IVoxaReply,
  transition: ITransition,
) => Promise<ITransition>;

export type IUnhandledStateCb = (
  event: IVoxaIntentEvent,
  stateName: string,
) => Promise<ITransition>;

export type IOnBeforeStateChangedCB = (
  event: IVoxaIntentEvent,
  reply: IVoxaReply,
  state: IState,
) => Promise<void>;

export interface IStateMachineConfig {
  states: any;
  onBeforeStateChanged?: IOnBeforeStateChangedCB[];
  onAfterStateChanged?: IStateMachineCb[];
  onUnhandledState?: IUnhandledStateCb[];
}
export class StateMachine {
  public states: any;
  public currentState?: IState;
  public onBeforeStateChangedCallbacks: IOnBeforeStateChangedCB[];
  public onAfterStateChangeCallbacks: IStateMachineCb[];
  public onUnhandledStateCallbacks: IUnhandledStateCb[];

  constructor(config: IStateMachineConfig) {
    this.validateConfig(config);
    this.states = _.cloneDeep(config.states);
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

  public validateConfig(config: IStateMachineConfig): void {
    if (!_.has(config, "states")) {
      throw new Error("State machine must have a `states` definition.");
    }

    if (!_.filter(config.states, "entry").length) {
      throw new Error("State machine must have a `entry` state.");
    }
  }

  /**
   * If the state didn't return a transition and
   * there's no global handler for the intent
   * we use the onUnhandledState handler
   */
  public async checkOnUnhandledState(
    voxaEvent: IVoxaIntentEvent,
    voxaReply: IVoxaReply,
    transition: ITransition,
  ): Promise<ITransition> {
    if (!isState(this.currentState)) {
      throw new Error("this.currentState is not a state");
    }

    if (!transition || _.isEmpty(transition)) {
      voxaEvent.log.debug("Running onUnhandledStateCallbacks");
      const onUnhandledStateTransitions = await bluebird.mapSeries(
        this.onUnhandledStateCallbacks,
        (fn: IUnhandledStateCb) => this.runCallbacks(fn, voxaEvent),
      );
      const onUnhandledStateTransition = _.last(onUnhandledStateTransitions);

      if (!onUnhandledStateTransition) {
        throw new UnhandledState(
          voxaEvent,
          onUnhandledStateTransition,
          this.currentState.name,
        );
      }

      return onUnhandledStateTransition;
    }

    return transition;
  }

  /**
   * If the state controller didn't return a transition
   * the state machine tries to find a handler for the intent
   * in the entry controller
   */
  public async checkForEntryFallback(
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
    transition: ITransition,
  ): Promise<ITransition> {
    voxaEvent.log.debug("Checking entry fallback");
    if (!isState(this.currentState)) {
      throw new Error("this.currentState is not a state");
    }

    if (!transition && this.currentState.name !== "entry") {
      // If no response try falling back to entry
      voxaEvent.log.debug(
        `No reply for ${voxaEvent.intent.name} in [${
          this.currentState.name
        }]. Trying [entry].`,
      );
      this.currentState = this.states.core.entry;
      return this.runCurrentState(voxaEvent, reply);
    }

    return transition;
  }

  public async onAfterStateChanged(
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
    transition: ITransition,
  ): Promise<ITransition> {
    if (transition && !transition.to) {
      _.merge(transition, { to: "die" });
    }

    if (!isState(this.currentState)) {
      throw new Error("this.currentState is not a state");
    }

    voxaEvent.log.debug(`${this.currentState.name} transition resulted in`, {
      transition,
    });
    voxaEvent.log.debug("Running onAfterStateChangeCallbacks");
    await bluebird.mapSeries(this.onAfterStateChangeCallbacks, (fn) => {
      return fn(voxaEvent, reply, transition);
    });

    voxaEvent.log.debug("Transition is now", { transition });
    return transition;
  }

  public async runTransition(
    currentStateName: string,
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
  ): Promise<ITransition> {
    this.currentState = this.getCurrentState(
      currentStateName,
      voxaEvent.platform.name,
    );
    this.runOnBeforeStateChanged(voxaEvent, reply);

    let transition: ITransition = await this.runCurrentState(voxaEvent, reply);

    if (!!transition && !_.isObject(transition)) {
      transition = { to: "die", flow: "terminate" };
      reply.terminate();
    }

    transition = await this.checkForEntryFallback(
      voxaEvent,
      reply,
      _.cloneDeep(transition),
    );
    transition = await this.checkOnUnhandledState(
      voxaEvent,
      reply,
      _.cloneDeep(transition),
    );
    transition = await this.onAfterStateChanged(
      voxaEvent,
      reply,
      _.cloneDeep(transition),
    );
    const sysTransition = new SystemTransition(transition);
    const to = this.getFinalTransition(sysTransition, voxaEvent, reply);

    if (sysTransition.shouldTerminate) {
      reply.terminate();
    }

    if (sysTransition.shouldContinue) {
      return this.runTransition(to.name, voxaEvent, reply);
    }

    return _.merge({}, sysTransition, to);
  }

  public async runCurrentState(
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
  ): Promise<ITransition> {
    if (!voxaEvent.intent) {
      throw new Error("Running the state machine without an intent");
    }

    if (!isState(this.currentState)) {
      throw new Error(`${JSON.stringify(this.currentState)} is not a state`);
    }

    const currentStateHandler = this.getCurrentStateHandler(voxaEvent.intent);
    if (currentStateHandler) {
      return currentStateHandler(voxaEvent, reply);
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
      throw new UnknownState(fromState);
    }

    if (isTransition(fromState.to)) {
      return fromState.to;
    }

    voxaEvent.log.debug(
      `Running simpleTransition for ${this.currentState.name}`,
    );
    const to = this.getDestinationStateName(fromState, voxaEvent.intent.name);
    return this.simpleTransition(
      voxaEvent.intent,
      this.currentState,
      voxaEvent.platform.name,
      to,
    );
  }

  public simpleTransition(
    voxaIntent: IVoxaIntent,
    state: any,
    platform: string,
    dest?: string | any,
  ): any {
    if (!dest || !_.isString(dest)) {
      return dest || {};
    }

    // on some ocassions a single object like state could have multiple transitions
    // Eg:
    // app.onState('entry', {
    //   WelcomeIntent: 'LaunchIntent',
    //   LaunchIntent: { reply: 'SomeReply' }
    // });
    if (this.isDestSameAsCurrent(dest, state)) {
      return this.simpleTransition(voxaIntent, state, platform, state.to[dest]);
    }

    const destObj =
      _.get(this.states, [platform, dest]) ||
      _.get(this.states, ["core", dest]);
    if (!destObj) {
      throw new UnknownState(dest);
    }

    return { to: dest };
  }

  protected runCallbacks(fn: IUnhandledStateCb, voxaEvent: IVoxaIntentEvent) {
    if (!isState(this.currentState)) {
      throw new Error("this.currentState is not a state");
    }

    return fn(voxaEvent, this.currentState.name);
  }

  protected getDestinationStateName(
    fromState: IState,
    intentName: string,
  ): string {
    let to = _.get(fromState, ["to", intentName]);
    if (!to) {
      to = _.get(this.states, ["core", fromState.name, "to", intentName]);
    }

    return to;
  }

  protected async runOnBeforeStateChanged(
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
  ) {
    const onBeforeState = this.onBeforeStateChangedCallbacks;
    voxaEvent.log.debug("Running onBeforeStateChanged");

    await bluebird.mapSeries(onBeforeState, (fn: IOnBeforeStateChangedCB) => {
      if (!isState(this.currentState)) {
        throw new Error("this.currentState is not a state");
      }

      return fn(voxaEvent, reply, this.currentState);
    });
  }

  protected getFinalTransition(
    sysTransition: SystemTransition,
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
  ) {
    let to;

    if (_.isString(sysTransition.to)) {
      if (
        !this.states.core[sysTransition.to] &&
        !_.get(this.states, [voxaEvent.platform.name, sysTransition.to])
      ) {
        throw new UnknownState(sysTransition.to);
      }

      to =
        _.get(this.states, [voxaEvent.platform.name, sysTransition.to]) ||
        this.states.core[sysTransition.to];
      Object.assign(sysTransition, { to });

      return to;
    }

    sysTransition.flow = "terminate";
    return { name: "die" };
  }

  protected getCurrentStateHandler(intent: IVoxaIntent) {
    const handler = _.get(this.currentState, ["enter", intent.name]);
    if (handler) {
      return handler;
    }

    return _.get(this.currentState, "enter.entry");
  }

  protected getCurrentState(currentStateName: string, platform: string) {
    return (
      _.get(this.states, [platform, currentStateName]) ||
      _.get(this.states, ["core", currentStateName])
    );
  }

  protected isDestSameAsCurrent(dest: any, state: any) {
    return state.to[dest] && dest !== state.to[dest];
  }
}
