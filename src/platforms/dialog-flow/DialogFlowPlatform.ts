import {
  GoogleCloudDialogflowV2Context,
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import * as _ from "lodash";
import { Model } from "../../Model";
import { VoxaPlatform } from "../VoxaPlatform";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import {
  AccountLinkingCard,
  BasicCard,
  Carousel,
  Confirmation,
  DateTime,
  DeepLink,
  List,
  MediaResponse,
  Permission,
  Place,
  RegisterUpdate,
  Suggestions,
  Table,
  TransactionDecision,
  TransactionRequirements,
  UpdatePermission,
} from "./directives";

export class DialogFlowPlatform extends VoxaPlatform {
  public async execute(rawEvent: GoogleCloudDialogflowV2WebhookRequest, context: any): Promise<DialogFlowReply> {
    const event = new DialogFlowEvent(rawEvent, context);
    const dialogFlowReply = new DialogFlowReply();
    dialogFlowReply.outputContexts =  event.session.contexts;
    const voxaReply = await this.app.execute(event, dialogFlowReply) as DialogFlowReply;
    return voxaReply;
  }

  public getDirectiveHandlers() {
    return [
      AccountLinkingCard,
      BasicCard,
      Carousel,
      Confirmation,
      DateTime,
      DeepLink,
      List,
      MediaResponse,
      Permission,
      Place,
      RegisterUpdate,
      Suggestions,
      Table,
      TransactionDecision,
      TransactionRequirements,
      UpdatePermission,
    ];
  }
}
