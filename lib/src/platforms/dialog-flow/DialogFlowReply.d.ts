import { GoogleCloudDialogflowV2Context, RichResponse } from "actions-on-google";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
export interface IDialogFlowPayload {
    google: {
        expectUserResponse: boolean;
        noInputPrompts?: any[];
        richResponse?: RichResponse;
        possibleIntents?: any;
        expectedInputs?: any;
        inputPrompt?: any;
        systemIntent?: any;
        isSsml?: boolean;
    };
}
export declare class DialogFlowReply implements IVoxaReply {
    outputContexts: GoogleCloudDialogflowV2Context[];
    fulfillmentText: string;
    source: string;
    payload: IDialogFlowPayload;
    constructor();
    saveSession(event: IVoxaEvent): Promise<void>;
    readonly speech: string;
    readonly hasMessages: boolean;
    readonly hasDirectives: boolean;
    readonly hasTerminated: boolean;
    clear(): void;
    terminate(): void;
    addStatement(statement: string): void;
    hasDirective(type: string | RegExp): boolean;
    addReprompt(reprompt: string): void;
}
