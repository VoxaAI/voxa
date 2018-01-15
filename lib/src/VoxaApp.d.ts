/// <reference types="i18next" />
import * as i18n from "i18next";
import { directiveHandler } from "./directives";
import { IModel } from "./Model";
import { IRenderer, IRendererConfig, Renderer } from "./renderers/Renderer";
import { ITransition } from "./StateMachine";
import { IVoxaEvent } from "./VoxaEvent";
import { IReply, VoxaReply } from "./VoxaReply";
export interface IVoxaAppConfig extends IRendererConfig {
    appIds?: string[] | string;
    Model?: IModel;
    RenderClass?: IRenderer;
    views: any;
    variables?: any;
}
export interface IDirectiveHandler {
    handler: (value: any) => directiveHandler;
    key?: string;
}
export declare type IEventHandler = (event: IVoxaEvent, response: VoxaReply, transition?: ITransition) => VoxaReply | void;
export declare type IErrorHandler = (event: IVoxaEvent, error: Error, ReplyClass: IReply<VoxaReply>) => VoxaReply;
export declare type IStateHandler = (event: IVoxaEvent) => ITransition;
export declare class VoxaApp {
    [x: string]: any;
    eventHandlers: any;
    requestHandlers: any;
    config: any;
    renderer: Renderer;
    i18nextPromise: PromiseLike<i18n.TranslationFunction>;
    states: any;
    directiveHandlers: IDirectiveHandler[];
    constructor(config: IVoxaAppConfig);
    registerDirectiveHandler(handler: (value: any) => directiveHandler, key?: string): void;
    validateConfig(): void;
    readonly requestTypes: string[];
    handleOnSessionEnded(voxaEvent: IVoxaEvent, response: VoxaReply): Promise<VoxaReply>;
    handleErrors(event: IVoxaEvent, error: Error, ReplyClass: IReply<VoxaReply>): Promise<VoxaReply>;
    execute(voxaEvent: IVoxaEvent, ReplyClass: IReply<VoxaReply>): Promise<any>;
    registerRequestHandler(requestType: string): void;
    registerEvents(): void;
    registerEvent(eventName: string): void;
    onState(stateName: string, handler: IStateHandler | ITransition, intents?: string[] | string): void;
    onIntent(intentName: string, handler: IStateHandler | ITransition): void;
    runStateMachine(voxaEvent: IVoxaEvent, response: VoxaReply): Promise<VoxaReply>;
    renderDirectives(voxaEvent: IVoxaEvent, response: VoxaReply, transition: ITransition): Promise<ITransition>;
    serializeModel(voxaEvent: IVoxaEvent, response: VoxaReply, transition: ITransition): Promise<void>;
    transformRequest(voxaEvent: IVoxaEvent): Promise<void>;
}
