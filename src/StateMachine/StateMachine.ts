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
import { UnknownState } from "../errors";
import { IVoxaIntentEvent } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";
import { State } from "./State";
import { ITransition, SystemTransition } from "./transitions";

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
  state: State,
) => Promise<void>;

export interface IStateMachineConfig {
  states: State[];
  onBeforeStateChanged?: IOnBeforeStateChangedCB[];
  onAfterStateChanged?: IStateMachineCb[];
  onUnhandledState?: IUnhandledStateCb;
}
export class StateMachine {
  public states: State[];
  public currentState!: State;
  public onBeforeStateChangedCallbacks: IOnBeforeStateChangedCB[];
  public onAfterStateChangeCallbacks: IStateMachineCb[];
  public onUnhandledStateCallback?: IUnhandledStateCb;

  constructor(config: IStateMachineConfig) {
    this.states = _.cloneDeep(config.states);
    this.onBeforeStateChangedCallbacks = config.onBeforeStateChanged || [];
    this.onAfterStateChangeCallbacks = config.onAfterStateChanged || [];
    this.onUnhandledStateCallback = config.onUnhandledState;

    this.states.push(new State("die", { flow: "terminate" }));
  }

  public async runTransition(
    fromState: string,
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
    recursions: number = 0,
  ): Promise<SystemTransition> {
    if (recursions > 10) {
      throw new Error("State Machine Recursion Error");
    }

    const transition = await this.stateTransition(fromState, voxaEvent, reply);

    let sysTransition = await this.checkOnUnhandledState(
      voxaEvent,
      reply,
      transition,
    );

    sysTransition = await this.onAfterStateChanged(
      voxaEvent,
      reply,
      sysTransition,
    );

    if (sysTransition.shouldTerminate) {
      reply.terminate();
    }

    if (sysTransition.shouldContinue) {
      return this.runTransition(
        sysTransition.to,
        voxaEvent,
        reply,
        recursions + 1,
      );
    }

    return sysTransition;
  }

  private async stateTransition(
    fromState: string,
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
  ): Promise<ITransition> {
    try {
      if (fromState === "entry") {
        this.currentState = this.getCurrentState(
          voxaEvent.intent.name,
          voxaEvent.intent.name,
          voxaEvent.platform.name,
        );
      } else {
        this.currentState = this.getCurrentState(
          fromState,
          voxaEvent.intent.name,
          voxaEvent.platform.name,
        );
      }
    } catch (error) {
      if (error instanceof UnknownState) {
        if (!this.onUnhandledStateCallback) {
          throw new Error(`${voxaEvent.intent.name} went unhandled`);
        }

        return this.onUnhandledStateCallback(voxaEvent, voxaEvent.intent.name);
      }
    }

    await this.runOnBeforeStateChanged(voxaEvent, reply);

    let transition: ITransition = await this.currentState.handle(voxaEvent);

    voxaEvent.log.debug(`${this.currentState.name} transition resulted in`, {
      transition,
    });

    if (!transition && fromState !== "entry") {
      this.currentState = this.getCurrentState(
        voxaEvent.intent.name,
        voxaEvent.intent.name,
        voxaEvent.platform.name,
      );

      transition = await this.currentState.handle(voxaEvent);
    }

    return transition;
  }

  private async onAfterStateChanged(
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
    transition: SystemTransition,
  ): Promise<SystemTransition> {
    voxaEvent.log.debug("Running onAfterStateChangeCallbacks");
    await bluebird.mapSeries(this.onAfterStateChangeCallbacks, (fn) => {
      return fn(voxaEvent, reply, transition);
    });

    voxaEvent.log.debug("Transition is now", { transition });
    return transition;
  }

  private async checkOnUnhandledState(
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
    transition: ITransition,
  ): Promise<SystemTransition> {
    if (!_.isEmpty(transition) || transition) {
      return new SystemTransition(transition);
    }

    if (!this.onUnhandledStateCallback) {
      throw new Error(`${voxaEvent.intent.name} went unhandled`);
    }

    const tr = await this.onUnhandledStateCallback(
      voxaEvent,
      this.currentState.name,
    );

    return new SystemTransition(tr);
  }

  private async runOnBeforeStateChanged(
    voxaEvent: IVoxaIntentEvent,
    reply: IVoxaReply,
  ) {
    const onBeforeState = this.onBeforeStateChangedCallbacks;
    voxaEvent.log.debug("Running onBeforeStateChanged");

    await bluebird.mapSeries(onBeforeState, (fn: IOnBeforeStateChangedCB) => {
      return fn(voxaEvent, reply, this.currentState);
    });
  }

  private getCurrentState(
    currentStateName: string,
    intentName: string,
    platform: string,
  ): State {
    const states: State[] = _(this.states)
      .filter({ name: currentStateName })
      .filter((s: State) => {
        return s.platform === platform || s.platform === "core";
      })
      // Sometimes a user might have defined more than one controller for the same state,
      // in that case we want to get the one for the current intent
      .filter((s: State) => {
        return s.intents.length === 0 || _.includes(s.intents, intentName);
      })
      .value();

    if (states.length === 0) {
      throw new UnknownState(currentStateName);
    }

    // if (states.length > 1) {
    // states = _(states)
    // .value();
    // }

    return states[0];
  }
}
