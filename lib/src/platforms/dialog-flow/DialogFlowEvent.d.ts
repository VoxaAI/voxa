import { DialogflowConversation, GoogleCloudDialogflowV2WebhookRequest } from "actions-on-google";
import { IVoxaEvent, IVoxaUser } from "../../VoxaEvent";
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
    conv: DialogflowConversation;
    constructor(event: GoogleCloudDialogflowV2WebhookRequest, context: any);
    readonly user: IVoxaUser;
    readonly supportedInterfaces: string[];
}
