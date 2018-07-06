import { ITransition } from "./StateMachine";
import { IVoxaEvent } from "./VoxaEvent";
import { IVoxaReply } from "./VoxaReply";
export interface IDirectiveClass {
    platform: string;
    key: string;
    new (...args: any[]): IDirective;
}
export interface IDirective {
    writeToReply: (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition) => Promise<void>;
}
export declare class Reply implements IDirective {
    viewPaths: string | string[];
    static key: string;
    static platform: string;
    constructor(viewPaths: string | string[]);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Reprompt implements IDirective {
    static key: string;
    static platform: string;
    viewPath: string;
    constructor(viewPath: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Ask implements IDirective {
    static key: string;
    static platform: string;
    viewPaths: string[];
    constructor(viewPaths: string | string[]);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Say implements IDirective {
    viewPaths: string | string[];
    static key: string;
    static platform: string;
    constructor(viewPaths: string | string[]);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class SayP implements IDirective {
    statements: string | string[];
    static key: string;
    static platform: string;
    constructor(statements: string | string[]);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Tell implements IDirective {
    static key: string;
    static platform: string;
    viewPath: string;
    constructor(viewPath: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
