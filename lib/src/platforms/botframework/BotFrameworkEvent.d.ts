import { IBotStorage, IBotStorageData, IConversationUpdate, IEvent, IIdentity, IMessage } from "botbuilder";
import { ITypeMap, IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
export declare class BotFrameworkEvent extends IVoxaEvent {
    platform: string;
    session: any;
    context: any;
    applicationPassword: string;
    applicationId: string;
    executionContext: any;
    rawEvent: IEvent;
    storage: IBotStorage;
    requestToRequest: ITypeMap;
    utilitiesIntentMapping: ITypeMap;
    constructor(message: IEvent, context: any, stateData: IBotStorageData, storage: IBotStorage, intent?: IVoxaIntent);
    readonly supportedInterfaces: never[];
    getIntentFromEntity(): void;
    mapUtilitiesIntent(intent: IVoxaIntent): IVoxaIntent;
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
