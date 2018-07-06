import * as i18n from "i18next";
import { Model } from "./Model";
import { Renderer } from "./renderers/Renderer";
export interface ITypeMap {
    [x: string]: string;
}
export declare abstract class IVoxaEvent {
    executionContext: any;
    rawEvent: any;
    session: IVoxaSession;
    intent?: IVoxaIntent;
    context: any;
    request: any;
    model: Model;
    t: i18n.TranslationFunction;
    renderer: Renderer;
    user: IVoxaUser;
    requestToIntent: ITypeMap;
    requestToRequest: ITypeMap;
    platform: string;
    constructor(event: any, context: any);
    abstract readonly supportedInterfaces: string[];
    mapRequestToIntent(): void;
    mapRequestToRequest(): void;
}
export interface IVoxaUser {
    id: string;
    accessToken?: string;
    [key: string]: any;
}
export interface IVoxaIntent {
    rawIntent: any;
    name: string;
    params: any;
}
export interface IVoxaSession {
    attributes: any;
    new: boolean;
    sessionId: string;
}
