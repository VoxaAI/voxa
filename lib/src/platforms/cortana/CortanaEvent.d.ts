/// <reference types="i18next" />
import { IBotStorageData, IConversationUpdate, IEvent, IIdentity, IMessage } from "botbuilder";
import { TranslationFunction } from "i18next";
import { Model } from "../../Model";
import { IRequestTypeMap, IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
export declare class CortanaEvent extends IVoxaEvent {
    platform: string;
    session: any;
    context: any;
    model: Model;
    t: TranslationFunction;
    intent?: IVoxaIntent;
    executionContext: any;
    rawEvent: IEvent;
    requestToRequest: IRequestTypeMap;
    constructor(message: IEvent, context: any, stateData: IBotStorageData, intent?: IVoxaIntent);
    readonly user: IIdentity & {
        userId: string;
    };
    mapRequestToIntent(): void;
    getRequest(): {
        type: string;
        locale: any;
    };
}
export declare function isIMessage(event: IEvent): event is IMessage;
export declare function isIConversationUpdate(event: IEvent | IConversationUpdate): event is IConversationUpdate;
