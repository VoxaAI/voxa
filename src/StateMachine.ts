import * as debug from 'debug';
import * as _ from 'lodash';
import * as bluebird from 'bluebird';

import { UnhandledState, UnknownState } from './Errors';
import { VoxaReply } from './VoxaReply';
import { IVoxaEvent } from './VoxaEvent';
import { Model } from './Model';
import { VoxaApp } from './VoxaApp';
import { IMessage, Renderer } from './renderers/Renderer';

const log:debug.IDebugger = debug('voxa');


export interface StateMachineConfig {
  states: any;
  onBeforeStateChanged?: StateMachineCallbackInterface[],
  onAfterStateChanged?: StateMachineCallbackInterface[],
  onUnhandledState?: StateMachineCallbackInterface[],
}

export interface Transition {
  to: string|State;
  reply: string|VoxaReply;
  directives: Array<any>;
  message?: any;
}


export interface StateMachineCallbackInterface {
  (event: IVoxaEvent, reply: VoxaReply, transition: Transition): Promise<Transition>;
}


export interface State {
  name: string;
  enter: any;
  to: State|string;
  isTerminal: boolean;
}

export class StateMachine<Reply extends VoxaReply> {
  public states: any;
  public currentState: State;
  public onBeforeStateChangedCallbacks: StateMachineCallbackInterface[];
  public onAfterStateChangeCallbacks: StateMachineCallbackInterface[];
  public onUnhandledStateCallbacks: StateMachineCallbackInterface[];

  constructor(currentState: string, config: StateMachineConfig) {
    this.validateConfig(config);
    this.states = config.states;
    this.currentState = this.states[currentState];
    this.onBeforeStateChangedCallbacks = config.onBeforeStateChanged || [];
    this.onAfterStateChangeCallbacks = config.onAfterStateChanged || [];
    this.onUnhandledStateCallbacks = config.onUnhandledState || [];

    // If die event does not exist auto complete it.
    if (!_.has(this.states, 'die')) {
      _.assign(this.states, {
        die: { isTerminal: true, name: 'die' },
      });
    }
  }

  validateConfig(config: StateMachineConfig): void {
    if (!_.has(config, 'states')) {
      throw new Error('State machine must have a `states` definition.');
    }
    if (!_.has(config.states, 'entry')) {
      throw new Error('State machine must have a `entry` state.');
    }
  }

  async checkOnUnhandledState(voxaEvent: IVoxaEvent, voxaReply: Reply, transition: Transition): Promise<Transition> {
    if (!transition) {
      log('Running onUnhandledStateCallbacks');
      const onUnhandledStateTransitions = await bluebird.mapSeries(this.onUnhandledStateCallbacks, (fn: Function) => fn(voxaEvent, this.currentState.name))
      const onUnhandledStateTransition = _.last(onUnhandledStateTransitions);

      if (!onUnhandledStateTransition) {
        throw new UnhandledState(voxaEvent, onUnhandledStateTransition, this.currentState.name);
      }

      return onUnhandledStateTransition;
    }

    return transition;
  }

  async checkForEntryFallback(voxaEvent: IVoxaEvent, reply: Reply, transition: Transition): Promise<Transition> {
    if (!transition && this.currentState.name !== 'entry') {
      // If no response try falling back to entry
      if (!voxaEvent.intent) {
        throw new Error('Running the state machine without an intent');
      }

      log(`No reply for ${voxaEvent.intent.name} in [${this.currentState.name}]. Trying [entry].`);
      this.currentState = this.states.entry;
      return this.runCurrentState(voxaEvent);
    }

    return transition;
  }

  async onAfterStateChanged(voxaEvent: IVoxaEvent, reply: Reply, transition: Transition): Promise<Transition> {
    if (transition && !transition.to) {
      _.merge(transition, { to: 'die' });
    }
    log(`${this.currentState.name} transition resulted in %j`, transition);
    log('Running onAfterStateChangeCallbacks');
    await bluebird.mapSeries(this.onAfterStateChangeCallbacks, fn => fn(voxaEvent, reply, transition))
    return transition;
  }

  async runTransition(voxaEvent: IVoxaEvent, reply: Reply): Promise<Transition> {
    const onBeforeState = this.onBeforeStateChangedCallbacks;
    await bluebird.mapSeries(onBeforeState, (fn: Function) => fn(voxaEvent, reply, this.currentState))
    let transition: Transition = await this.runCurrentState(voxaEvent);
    transition = await this.checkForEntryFallback(voxaEvent, reply, transition);
    transition = await this.checkOnUnhandledState(voxaEvent, reply, transition);
    transition = await this.onAfterStateChanged(voxaEvent, reply, transition);
    let to;
    if (transition.to && _.isString(transition.to)) {
      if (!this.states[transition.to]) {
        throw new UnknownState(transition.to);
      }
      to = this.states[transition.to];
      transition.to = to;
    } else {
      to = { name: 'die' };
    }

    if (reply.isYielding() || !transition.to || !_.isString(transition.to) && transition.to.isTerminal) {
      const result: any = { to };
      if (_.isString(transition.reply) || _.isArray(transition.reply)) {
        result.reply = transition.reply;
      }
      return result;
    }

    this.currentState = this.states[to.name];
    return this.runTransition(voxaEvent, reply);
  }

  async runCurrentState(voxaEvent: IVoxaEvent): Promise<Transition> {
    const self = this;
    if (!voxaEvent.intent) {
      throw new Error('Running the state machine without an intent');
    }

    if (_.get(this.currentState, ['enter', voxaEvent.intent.name])) {
      log(`Running ${this.currentState.name} enter function for ${voxaEvent.intent.name}`);
      return this.currentState.enter[voxaEvent.intent.name](voxaEvent);
    }

    if (_.get(this.currentState, 'enter.entry')) {
      log(`Running ${this.currentState.name} enter function entry`);
      return this.currentState.enter.entry(voxaEvent)
    }

    log(`Running simpleTransition for ${this.currentState.name}`);
    const fromState = this.currentState;
    const to = _.get(fromState, ['to', voxaEvent.intent.name]);
    return simpleTransition(this.currentState, to);

    function simpleTransition(state: any, dest: string): any {
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

      const destObj = self.states[dest];
      if (!destObj) {
        throw new UnknownState(dest);
      }

      return { to: dest };
    }
  }
}
