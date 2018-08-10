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
  flow?: string;
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

// A helper class for transitions. Users can return transitions as an object with various command keys.
// For developer flexibility we allow that transition object to be vague.
// This object wraps the ITransition and gives defaults helps interpret what the various toggles mean.
class SystemTransition implements ITransition {

  [propname: string]: any;
  public to?: string|IState|ITransition; // default to 'entry'
  public flow?: string;

  constructor(transition: ITransition) {
    Object.assign(this, transition);
    this.flow = this.flow || "continue";
  }

  get shouldTerminate(): boolean {
    return this.flow === "terminate" || ( isState(this.to) && this.to.isTerminal);
  }

  get shouldContinue(): boolean {
    return this.flow === "continue" && this.to && isState(this.to) && !this.to.isTerminal;
  }
}

export class StateMachine {
  public states: any;
  public currentState?: IState;
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

    if (!_.filter(config.states, "entry").length) {
      throw new Error("State machine must have a `entry` state.");
    }
  }

  public async checkOnUnhandledState(
    voxaEvent: IVoxaEvent,
    voxaReply: IVoxaReply,
    transition: ITransition): Promise<ITransition> {
    if (!isState(this.currentState)) {
      throw new Error("this.currentState is not a state");
    }

    const runCallbacks = (fn: IUnhandledStateCb) => {
      if (!isState(this.currentState)) {
        throw new Error("this.currentState is not a state");
      }

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

  public async checkForEntryFallback(
    voxaEvent: IVoxaEvent,
    reply: IVoxaReply,
    transition: ITransition): Promise<ITransition> {
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
  }

  public async onAfterStateChanged(
    voxaEvent: IVoxaEvent,
    reply: IVoxaReply,
    transition: ITransition): Promise<ITransition> {
    if (transition && !transition.to) {
      _.merge(transition, { to: "die" });
    }

    if (!isState(this.currentState)) {
      throw new Error("this.currentState is not a state");
    }

    log(`${this.currentState.name} transition resulted in`, transition);
    log("Running onAfterStateChangeCallbacks");
    await bluebird.mapSeries(this.onAfterStateChangeCallbacks, (fn) => {
      return fn(voxaEvent, reply, transition);
    });

    log("Transition is now", transition);
    return transition;
  }

  public async runTransition(currentState: string, voxaEvent: IVoxaEvent, reply: IVoxaReply): Promise<ITransition> {
    this.currentState = _.get( this.states,
      [voxaEvent.platform, currentState]) || _.get(this.states, ["core", currentState]);

    const onBeforeState = this.onBeforeStateChangedCallbacks;
    log("Running onBeforeStateChanged");

    await bluebird.mapSeries(onBeforeState, (fn: IOnBeforeStateChangedCB) => {
      if (!isState(this.currentState)) {
        throw new Error("this.currentState is not a state");
      }

      return fn(voxaEvent, reply, this.currentState);
    });

    let transition: ITransition = await this.runCurrentState(voxaEvent, reply);

    if (!!transition && !_.isObject(transition)) {
      transition = { to: "die", flow: "terminate" };
      reply.terminate();
    }

    transition = await this.checkForEntryFallback(voxaEvent, reply, transition);
    transition = await this.checkOnUnhandledState(voxaEvent, reply, transition);
    transition = await this.onAfterStateChanged(voxaEvent, reply, transition);
    const sysTransition = new SystemTransition(transition);
    let to;

    if (sysTransition.to && _.isString(sysTransition.to)) {
      if (!this.states.core[sysTransition.to] && !_.get(this.states, [voxaEvent.platform, sysTransition.to])) {
        throw new UnknownState(sysTransition.to);
      }
      to = _.get(this.states, [voxaEvent.platform, sysTransition.to]) || this.states.core[sysTransition.to];
      Object.assign(sysTransition, {to});
    } else {
      to = { name: "die" };
      sysTransition.flow = "terminate";
    }

    if (sysTransition.shouldTerminate) {
      reply.terminate();
    }

    if (sysTransition.shouldContinue) {
      return this.runTransition(to.name, voxaEvent, reply);
    }
    return _.merge({}, sysTransition, to);
  }

  public async runCurrentState(voxaEvent: IVoxaEvent, reply: IVoxaReply): Promise<ITransition> {
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
