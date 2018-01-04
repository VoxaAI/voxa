import { IConversationUpdate, IMessage } from "botbuilder";
import { IVoxaIntent } from "../../VoxaEvent";
export declare class CortanaIntent implements IVoxaIntent {
    name: string;
    params: any;
    rawIntent: any;
    constructor(message: IMessage | IConversationUpdate);
}
