import {
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import { VoxaPlatform } from "../VoxaPlatform";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import {
  AccountLinkingCard,
  BasicCard,
  BrowseCarousel,
  Carousel,
  Confirmation,
  DateTime,
  DeepLink,
  List,
  MediaResponse,
  NewSurface,
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
  public async execute(
    rawEvent: GoogleCloudDialogflowV2WebhookRequest,
    context: any,
  ): Promise<DialogFlowReply> {
    const event = new DialogFlowEvent(rawEvent, context);
    const dialogFlowReply = new DialogFlowReply();
    const voxaReply = (await this.app.execute(
      event,
      dialogFlowReply,
    )) as DialogFlowReply;
    return voxaReply;
  }

  protected getDirectiveHandlers() {
    return [
      AccountLinkingCard,
      BasicCard,
      BrowseCarousel,
      Carousel,
      Confirmation,
      DateTime,
      DeepLink,
      List,
      MediaResponse,
      Permission,
      NewSurface,
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
