/// <reference types="i18next" />
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { IVoxaEvent } from "../../VoxaEvent";
import { DialogFlowIntent } from "./DialogFlowIntent";
import { DialogFlowSession } from "./DialogFlowSession";
export declare class DialogFlowEvent extends IVoxaEvent {
    executionContext: any;
    rawEvent: any;
    session: DialogFlowSession;
    request: any;
    platform: string;
    context: any;
    intent: DialogFlowIntent;
    model: Model;
    t: TranslationFunction;
    constructor(event: any, context: any);
    readonly user: any;
}
