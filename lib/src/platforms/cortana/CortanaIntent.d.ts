import { IConversationUpdate, IEvent, IMessage } from "botbuilder";
import { IVoxaIntent } from "../../VoxaEvent";
export declare function isIConversationUpdate(event: IEvent | IConversationUpdate): event is IConversationUpdate;
export declare function isIMessage(event: IEvent): event is IMessage;
export declare class CortanaIntent implements IVoxaIntent {
    name: string;
    params: any;
    rawIntent: any;
    constructor(message: IEvent);
}
