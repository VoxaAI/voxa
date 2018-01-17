/// <reference types="i18next" />
import * as i18n from "i18next";
import { Model } from "./Model";
export interface IRequestTypeMap {
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
    user: IVoxaUser;
    requestToIntent: IRequestTypeMap;
    requestToRequest: IRequestTypeMap;
    platform: string;
    constructor(event: any, context: any);
    mapRequestToIntent(): void;
    mapRequestToRequest(): void;
}
export interface IVoxaUser {
    id: string;
    name?: string;
}
export interface IVoxaIntent {
    rawIntent: any;
    name: string;
    params: any;
}
export interface IVoxaSession {
    attributes: any;
    new: boolean;
    sessionId?: string;
}
