/// <reference types="i18next" />
import { IBotStorageData, IEvent, IIdentity } from "botbuilder";
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
export declare class CortanaEvent extends IVoxaEvent {
    platform: string;
    session: any;
    context: any;
    model: Model;
    t: TranslationFunction;
    intent?: IVoxaIntent;
    executionContext: any;
    rawEvent: IEvent;
    constructor(message: IEvent, context: any, stateData: IBotStorageData, intent?: IVoxaIntent);
    readonly user: IIdentity & {
        userId: string;
    };
    readonly request: {
        type: string;
        locale: any;
    };
}
