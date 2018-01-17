/// <reference types="i18next" />
import * as alexa from "alexa-sdk";
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
export interface IAlexaRequest extends alexa.RequestBody<alexa.Request> {
    context: any;
}
export interface ILaunchRequest extends alexa.RequestBody<alexa.LaunchRequest> {
    context: any;
}
export interface ISessionEndedRequest extends alexa.RequestBody<alexa.SessionEndedRequest> {
    context: any;
}
export declare class AlexaEvent extends IVoxaEvent {
    session: any;
    request: any;
    platform: string;
    context: any;
    intent: IVoxaIntent;
    model: Model;
    t: TranslationFunction;
    requestToIntent: any;
    constructor(event: IAlexaRequest, context?: any);
    readonly user: any;
    readonly token: any;
}
