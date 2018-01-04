import { IVoxaEvent } from "../VoxaEvent";
export interface IRendererConfig {
    variables: any;
    views: any;
}
export interface IMessage {
    [name: string]: any;
    ask?: string;
    tell?: string;
    say?: string;
    reprompt?: string;
    card?: any;
    directives?: any[];
}
export interface IRenderer {
    new (config: IRendererConfig): Renderer;
}
export declare class Renderer {
    config: any;
    constructor(config: IRendererConfig);
    renderPath(view: string, voxaEvent: IVoxaEvent, variables?: any): Promise<any>;
    renderMessage(msg: any, event: IVoxaEvent): Promise<any>;
    renderStatement(statement: string, voxaEvent: IVoxaEvent): Promise<any>;
}
