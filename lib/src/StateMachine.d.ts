import { IVoxaEvent } from "./VoxaEvent";
import { VoxaReply } from "./VoxaReply";
export declare type IStateMachineCb = (event: IVoxaEvent, reply: VoxaReply, transition: ITransition) => Promise<ITransition>;
export declare type IUnhandledStateCb = (event: IVoxaEvent, stateName: string) => Promise<ITransition>;
export declare type IOnBeforeStateChangedCB = (event: IVoxaEvent, reply: VoxaReply, state: IState) => Promise<void>;
export interface IStateMachineConfig {
    states: any;
    onBeforeStateChanged?: IOnBeforeStateChangedCB[];
    onAfterStateChanged?: IStateMachineCb[];
    onUnhandledState?: IUnhandledStateCb[];
}
export interface ITransition {
    [propname: string]: any;
    to?: string | IState | ITransition;
    reply?: string | VoxaReply;
    directives?: any[];
    message?: any;
}
export interface IState {
    name: string;
    enter: any;
    to: IState | string;
    isTerminal: boolean;
}
export declare function isTransition(object: any): object is ITransition;
export declare function isState(object: any): object is IState;
export declare class StateMachine<Reply extends VoxaReply> {
    states: any;
    currentState: IState;
    onBeforeStateChangedCallbacks: IOnBeforeStateChangedCB[];
    onAfterStateChangeCallbacks: IStateMachineCb[];
    onUnhandledStateCallbacks: IUnhandledStateCb[];
    constructor(currentState: string, config: IStateMachineConfig);
    validateConfig(config: IStateMachineConfig): void;
    checkOnUnhandledState(voxaEvent: IVoxaEvent, voxaReply: Reply, transition: ITransition): Promise<ITransition>;
    checkForEntryFallback(voxaEvent: IVoxaEvent, reply: Reply, transition: ITransition): Promise<ITransition>;
    onAfterStateChanged(voxaEvent: IVoxaEvent, reply: Reply, transition: ITransition): Promise<ITransition>;
    runTransition(voxaEvent: IVoxaEvent, reply: Reply): Promise<ITransition>;
    runCurrentState(voxaEvent: IVoxaEvent, reply: Reply): Promise<ITransition>;
}
