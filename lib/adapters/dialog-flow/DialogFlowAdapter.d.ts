import { Responses } from "actions-on-google";
import { IVoxaSession } from "../../VoxaEvent";
import { VoxaReply } from "../../VoxaReply";
import { VoxaAdapter } from "../VoxaAdapter";
import { DialogFlowReply } from "./DialogFlowReply";
export declare class DialogFlowAdapter extends VoxaAdapter<DialogFlowReply> {
    static sessionToContext(session: IVoxaSession): any[];
    static google(reply: DialogFlowReply): {
        expectUserResponse: boolean;
        isSsml: boolean;
        noInputPrompts: {
            ssml: string;
        }[];
        possibleIntents: undefined;
        richResponse: Responses.RichResponse;
    };
    static toDialogFlowResponse(voxaReply: VoxaReply): any;
    execute(rawEvent: any, context: any): Promise<any>;
}
