import * as bluebird from "bluebird";
import * as debug from "debug";
import * as _ from "lodash";

import { UnhandledState, UnknownState } from "./errors";
import { Model } from "./Model";
import { IMessage, Renderer } from "./renderers/Renderer";
import { VoxaApp } from "./VoxaApp";
import { IVoxaEvent } from "./VoxaEvent";
import { IVoxaReply } from "./VoxaReply";

const log: debug.IDebugger = debug("voxa");

export type IStateMachineCb = (
  event: IVoxaEvent,
  reply: IVoxaReply,
  transition: ITransition,
) => Promise<ITransition>;

export type IUnhandledStateCb = (
  event: IVoxaEvent,
  stateName: string,
) => Promise<ITransition>;

export type IOnBeforeStateChangedCB = (
  event: IVoxaEvent,
  reply: IVoxaReply,
  state: IState,
) => Promise<void>;

export interface IStateMachineConfig {
  states: any;
  onBeforeStateChanged?: IOnBeforeStateChangedCB[];
  onAfterStateChanged?: IStateMachineCb[];
  onUnhandledState?: IUnhandledStateCb[];
}

export interface ITransition {
  [propname: string]: any;
  to?: string|IState|ITransition; // default to 'entry'
  reply?: string|IVoxaReply;
  directives?: any[];
  message?: any;
}

export interface IState {
  name: string;
  enter: any;
  to?: IState|string;
  isTerminal: boolean;
}

export function isTransition(object: any): object is ITransition {
    return object && "to" in object;
}

export function isState(object: any): object is IState {
  return object  && "name" in object ;
}

export class StateMachine {
  public states: any;
  public currentState: IState;
  public onBeforeStateChangedCallbacks: IOnBeforeStateChangedCB[];
  public onAfterStateChangeCallbacks: IStateMachineCb[];
  public onUnhandledStateCallbacks: IUnhandledStateCb[];

  constructor(config: IStateMachineConfig) {
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

  public validateConfig(config: IStateMachineConfig): void {
    if (!_.has(config, "states")) {
      throw new Error("State machine must have a `states` definition.");
    }
    if (!_.has(config.states, "core.entry")) {
      throw new Error("State machine must have a `entry` state.");
    }
  }

  public async checkOnUnhandledState(voxaEvent: IVoxaEvent, voxaReply: IVoxaReply, transition: ITransition): Promise<ITransition> {
    const runCallbacks = (fn: IUnhandledStateCb) => {
      return  fn(voxaEvent, this.currentState.name);
    };

    if (!transition || _.isEmpty(transition)) {
      log("Running onUnhandledStateCallbacks");
      const onUnhandledStateTransitions = await bluebird.mapSeries(this.onUnhandledStateCallbacks, runCallbacks);
      const onUnhandledStateTransition = _.last(onUnhandledStateTransitions);

      if (!onUnhandledStateTransition) {
        throw new UnhandledState(voxaEvent, onUnhandledStateTransition, this.currentState.name);
      }

      return onUnhandledStateTransition;

    }

    return transition;
  }

  public async checkForEntryFallback(voxaEvent: IVoxaEvent, reply: IVoxaReply, transition: ITransition): Promise<ITransition> {
    log("Checking entry fallback");
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
  }

  public async onAfterStateChanged(voxaEvent: IVoxaEvent, reply: IVoxaReply, transition: ITransition): Promise<ITransition> {
    if (transition && !transition.to) {
      _.merge(transition, { to: "die" });
    }
    log(`${this.currentState.name} transition resulted in %j`, transition);
    log("Running onAfterStateChangeCallbacks");
    let count = 0;
    await bluebird.mapSeries(this.onAfterStateChangeCallbacks, (fn) => {
      count += 1;
      return fn(voxaEvent, reply, transition);
    });

    log("Transition is now", transition);
    return transition;
  }

  public async runTransition(currentState: string, voxaEvent: IVoxaEvent, reply: IVoxaReply): Promise<ITransition> {
    this.currentState = _.get(this.states, [voxaEvent.platform, currentState]) || _.get(this.states, ["core", currentState]);
    if (!this.currentState) {
      throw new UnknownState(currentState);
    }

    const onBeforeState = this.onBeforeStateChangedCallbacks;
    log("Running onBeforeStateChanged");
    await bluebird.mapSeries(onBeforeState, (fn: IOnBeforeStateChangedCB) => fn(voxaEvent, reply, this.currentState));
    let transition: ITransition = await this.runCurrentState(voxaEvent, reply);

    if (!!transition && !_.isObject(transition)) {
      transition = { to: "die", flow: "terminate" };
    }

    transition = await this.checkForEntryFallback(voxaEvent, reply, transition);
    transition = await this.checkOnUnhandledState(voxaEvent, reply, transition);
    transition = await this.onAfterStateChanged(voxaEvent, reply, transition);
    let to;

    if (_.isObject(transition) && !_.isEmpty(transition) && !transition.flow) {
      transition.flow = "continue";
    }

    if (transition.to && _.isString(transition.to)) {
      if (!this.states.core[transition.to] && !_.get(this.states, [voxaEvent.platform, transition.to])) {
        throw new UnknownState(transition.to);
      }
      to = _.get(this.states, [voxaEvent.platform, transition.to]) || this.states.core[transition.to];
      transition.to = to;
    } else {
      to = { name: "die" };
      transition.flow = "terminate";
    }

    if (transition.flow === "terminate") {
      reply.terminate();
    }

    if (transition.flow !== "continue" || !transition.to || isState(transition.to) && transition.to.isTerminal) {
      const result: any = { to };
      if (_.isString(transition.reply) || _.isArray(transition.reply)) {
        result.reply = transition.reply;
      }
      return result;
    }

    return this.runTransition(to.name, voxaEvent, reply);
  }

  public async runCurrentState(voxaEvent: IVoxaEvent, reply: IVoxaReply): Promise<ITransition> {
    const self = this;
    if (!voxaEvent.intent) {
      throw new Error("Running the state machine without an intent");
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
    if (isTransition(fromState.to)) {
      return  fromState.to;
    }

    log(`Running simpleTransition for ${this.currentState.name}`);
    let to = _.get(fromState, ["to", voxaEvent.intent.name]);
    if (!to) {
      to = _.get(this.states, ["core", fromState.name, "to", voxaEvent.intent.name]);
    }

    return this.simpleTransition(voxaEvent, this.currentState, to);
  }

  public simpleTransition(voxaEvent: IVoxaEvent, state: any, dest: string): any {
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
      throw new UnknownState(dest);
    }

    return { to: dest };
  }
}
