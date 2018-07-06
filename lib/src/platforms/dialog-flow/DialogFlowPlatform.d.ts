import { GoogleCloudDialogflowV2WebhookRequest } from "actions-on-google";
import { VoxaPlatform } from "../VoxaPlatform";
import { DialogFlowReply } from "./DialogFlowReply";
import { AccountLinkingCard, BasicCard, Carousel, Confirmation, DateTime, DeepLink, List, MediaResponse, NewSurface, Permission, Place, RegisterUpdate, Suggestions, Table, TransactionDecision, TransactionRequirements, UpdatePermission } from "./directives";
export declare class DialogFlowPlatform extends VoxaPlatform {
    execute(rawEvent: GoogleCloudDialogflowV2WebhookRequest, context: any): Promise<DialogFlowReply>;
    getDirectiveHandlers(): (typeof List | typeof Carousel | typeof Suggestions | typeof BasicCard | typeof AccountLinkingCard | typeof MediaResponse | typeof Permission | typeof DateTime | typeof Confirmation | typeof DeepLink | typeof Place | typeof TransactionDecision | typeof TransactionRequirements | typeof RegisterUpdate | typeof UpdatePermission | typeof Table | typeof NewSurface)[];
}
