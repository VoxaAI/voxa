import { IVoxaEvent } from "./VoxaEvent";
import { IVoxaReply } from "./VoxaReply";
export declare type IStateMachineCb = (event: IVoxaEvent, reply: IVoxaReply, transition: ITransition) => Promise<ITransition>;
export declare type IUnhandledStateCb = (event: IVoxaEvent, stateName: string) => Promise<ITransition>;
export declare type IOnBeforeStateChangedCB = (event: IVoxaEvent, reply: IVoxaReply, state: IState) => Promise<void>;
export interface IStateMachineConfig {
    states: any;
    onBeforeStateChanged?: IOnBeforeStateChangedCB[];
    onAfterStateChanged?: IStateMachineCb[];
    onUnhandledState?: IUnhandledStateCb[];
}
export interface ITransition {
    [propname: string]: any;
    to?: string | IState | ITransition;
}
export interface IState {
    name: string;
    enter: any;
    to?: IState | string;
    isTerminal: boolean;
}
export declare function isTransition(object: any): object is ITransition;
export declare function isState(object: any): object is IState;
export declare class StateMachine {
    states: any;
    currentState?: IState;
    onBeforeStateChangedCallbacks: IOnBeforeStateChangedCB[];
    onAfterStateChangeCallbacks: IStateMachineCb[];
    onUnhandledStateCallbacks: IUnhandledStateCb[];
    constructor(config: IStateMachineConfig);
    validateConfig(config: IStateMachineConfig): void;
    checkOnUnhandledState(voxaEvent: IVoxaEvent, voxaReply: IVoxaReply, transition: ITransition): Promise<ITransition>;
    checkForEntryFallback(voxaEvent: IVoxaEvent, reply: IVoxaReply, transition: ITransition): Promise<ITransition>;
    onAfterStateChanged(voxaEvent: IVoxaEvent, reply: IVoxaReply, transition: ITransition): Promise<ITransition>;
    runTransition(currentState: string, voxaEvent: IVoxaEvent, reply: IVoxaReply): Promise<ITransition>;
    runCurrentState(voxaEvent: IVoxaEvent, reply: IVoxaReply): Promise<ITransition>;
    simpleTransition(voxaEvent: IVoxaEvent, state: any, dest: string): any;
}
