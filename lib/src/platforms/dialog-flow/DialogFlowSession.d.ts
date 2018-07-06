import { Contexts, DialogflowConversation } from "actions-on-google";
import { IVoxaSession } from "../../VoxaEvent";
export declare class DialogFlowSession implements IVoxaSession {
    attributes: any;
    new: boolean;
    sessionId: string;
    contexts: Contexts;
    constructor(conv: DialogflowConversation);
    getAttributes(conv: DialogflowConversation): any;
}
