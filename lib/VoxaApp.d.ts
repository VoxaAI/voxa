/// <reference types="i18next" />
import * as i18n from "i18next";
import { IModel } from "./Model";
import { IRenderer, IRendererConfig, Renderer } from "./renderers/Renderer";
import { ITransition } from "./StateMachine";
import { IVoxaEvent } from "./VoxaEvent";
import { IReply, VoxaReply } from "./VoxaReply";
export interface IVoxaAppConfig extends IRendererConfig {
    appIds?: string[] | string;
    Model: IModel;
    RenderClass: IRenderer;
    views: any;
    variables: any;
}
export declare type ISessionEndedHandler = (event: IVoxaEvent, reply: VoxaReply) => VoxaReply;
export declare type IErrorHandler = (event: IVoxaEvent, error: Error, ReplyClass: IReply<VoxaReply>) => VoxaReply;
export declare class VoxaApp {
    [x: string]: any;
    eventHandlers: any;
    requestHandlers: any;
    config: IVoxaAppConfig;
    renderer: Renderer;
    i18nextPromise: PromiseLike<i18n.TranslationFunction>;
    states: any;
    constructor(config: IVoxaAppConfig);
    validateConfig(): void;
    readonly requestTypes: string[];
    handleOnSessionEnded(voxaEvent: IVoxaEvent, reply: VoxaReply): Promise<VoxaReply>;
    handleErrors(event: IVoxaEvent, error: Error, ReplyClass: IReply<VoxaReply>): Promise<VoxaReply>;
    execute(voxaEvent: IVoxaEvent, ReplyClass: IReply<VoxaReply>): Promise<any>;
    registerRequestHandler(requestType: string): void;
    registerEvents(): void;
    registerEvent(eventName: string): void;
    onState(stateName: string, handler: Function | ITransition, intents?: string[] | string): void;
    onIntent(intentName: string, handler: Function): void;
    runStateMachine(voxaEvent: IVoxaEvent, reply: VoxaReply): Promise<VoxaReply>;
    transformRequest(voxaEvent: IVoxaEvent): Promise<void>;
}
