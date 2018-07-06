import * as i18n from "i18next";
import { Context as AWSLambdaContext } from "aws-lambda";
import { IDirectiveClass } from "./directives";
import { IModel } from "./Model";
import { IRenderer, IRendererConfig, Renderer } from "./renderers/Renderer";
import { ITransition } from "./StateMachine";
import { IVoxaEvent } from "./VoxaEvent";
import { IVoxaReply } from "./VoxaReply";
export interface IVoxaAppConfig extends IRendererConfig {
    appIds?: string[] | string;
    Model?: IModel;
    RenderClass?: IRenderer;
    views: any;
    variables?: any;
}
export declare type IEventHandler = (event: IVoxaEvent, response: IVoxaReply, transition?: ITransition) => IVoxaReply | void;
export declare type IErrorHandler = (event: IVoxaEvent, error: Error, ReplyClass: IVoxaReply) => IVoxaReply;
export declare type IStateHandler = (event: IVoxaEvent) => ITransition;
export declare class VoxaApp {
    [key: string]: any;
    eventHandlers: any;
    requestHandlers: any;
    config: any;
    renderer: Renderer;
    i18nextPromise: PromiseLike<i18n.TranslationFunction>;
    i18n: i18n.i18n;
    states: any;
    directiveHandlers: IDirectiveClass[];
    constructor(config: IVoxaAppConfig);
    validateConfig(): void;
    readonly requestTypes: string[];
    handleOnSessionEnded(event: IVoxaEvent, response: IVoxaReply): Promise<IVoxaReply>;
    handleErrors(event: IVoxaEvent, error: Error, reply: IVoxaReply): Promise<IVoxaReply>;
    execute(voxaEvent: IVoxaEvent, reply: IVoxaReply): Promise<IVoxaReply>;
    registerRequestHandler(requestType: string): void;
    registerEvents(): void;
    registerEvent(eventName: string): void;
    onState(stateName: string, handler: IStateHandler | ITransition, intents?: string[] | string, platform?: string): void;
    onIntent(intentName: string, handler: IStateHandler | ITransition, platform?: string): void;
    runStateMachine(voxaEvent: IVoxaEvent, response: IVoxaReply): Promise<IVoxaReply>;
    renderDirectives(voxaEvent: IVoxaEvent, response: IVoxaReply, transition: ITransition): Promise<ITransition>;
    serializeModel(voxaEvent: IVoxaEvent, response: IVoxaReply, transition: ITransition): Promise<void>;
    transformRequest(voxaEvent: IVoxaEvent): Promise<void>;
}
export declare function timeout(context: AWSLambdaContext): Promise<void>;
