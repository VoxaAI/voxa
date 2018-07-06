import { DialogflowConversation } from "actions-on-google";
import { IVoxaIntent } from "../../VoxaEvent";
export declare class DialogFlowIntent implements IVoxaIntent {
    name: string;
    params: any;
    rawIntent: DialogflowConversation;
    constructor(conv: DialogflowConversation);
    getParams(): any;
}
