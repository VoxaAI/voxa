import { VoxaPlatform } from "../VoxaPlatform";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import {
  AccountLinkingCard,
  BasicCard,
  Carousel,
  List,
  MediaResponse,
  Suggestions,
} from "./directives";

export class DialogFlowPlatform extends VoxaPlatform {
  public async execute(rawEvent: any, context: any): Promise<DialogFlowReply> {
    const event = new DialogFlowEvent(rawEvent, context);
    const voxaReply = await this.app.execute(event, new DialogFlowReply()) as DialogFlowReply;
    voxaReply.contextOut.push(await voxaReply.modelToSessionContext(event.model));
    return voxaReply;
  }

  public getDirectiveHandlers() {
    return [
      List,
      Carousel,
      Suggestions,
      BasicCard,
      AccountLinkingCard,
      MediaResponse,
    ];
  }
}
