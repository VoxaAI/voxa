import { Renderer } from "./renderers/Renderer";
import { IVoxaEvent } from "./VoxaEvent";
export interface IReply<Reply extends VoxaReply> {
    new (event: IVoxaEvent, renderer: Renderer): Reply;
}
export declare type directiveHandler = (reply: VoxaReply, event: IVoxaEvent) => Promise<void>;
export interface IDirectiveHandler {
    handler: (value: any) => directiveHandler;
    key?: string;
}
export interface IResponse {
    statements: string[];
    reprompt: string;
    terminate: boolean;
    directives: any[];
    yield: boolean;
}
export declare abstract class VoxaReply {
    voxaEvent: IVoxaEvent;
    session: any;
    response: IResponse;
    error?: Error;
    directiveHandlers: IDirectiveHandler[];
    renderer: Renderer;
    constructor(voxaEvent: IVoxaEvent, renderer: Renderer);
    render(templatePath: string, variables?: any): Promise<string | any>;
    addStatement(statement: string): void;
    registerDirectiveHandler(handler: (value: any) => directiveHandler, key?: string): void;
    readonly hasMessages: boolean;
    readonly hasDirectives: boolean;
    clear(): void;
    yield(): this;
    hasDirective(type: string | RegExp): boolean;
    isYielding(): boolean;
}
export declare function reply(templatePaths: string | string[]): directiveHandler;
export declare function ask(templatePath: string): directiveHandler;
export declare function askP(statement: string): directiveHandler;
export declare function tell(templatePath: string): directiveHandler;
export declare function tellP(statement: string): directiveHandler;
export declare function say(templatePath: string): directiveHandler;
export declare function sayP(statement: string): directiveHandler;
export declare function reprompt(templatePath: string): directiveHandler;
export declare function directives(functions: directiveHandler[]): directiveHandler;
