import { Renderer } from "./renderers/Renderer";
import { IVoxaEvent } from "./VoxaEvent";
export interface IReply<Reply extends VoxaReply> {
    new (event: IVoxaEvent, renderer: Renderer): Reply;
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
    renderer: Renderer;
    constructor(voxaEvent: IVoxaEvent, renderer: Renderer);
    render(templatePath: string, variables?: any): Promise<string | any>;
    addStatement(statement: string): void;
    readonly hasMessages: boolean;
    readonly hasDirectives: boolean;
    clear(): void;
    yield(): this;
    hasDirective(type: string | RegExp | ((x: any) => boolean)): boolean;
    isYielding(): boolean;
}
