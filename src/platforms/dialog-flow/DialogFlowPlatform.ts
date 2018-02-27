import { VoxaPlatform } from "../VoxaPlatform";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { BasicCard, Carousel, List, Suggestions  } from "./directives";

export class DialogFlowPlatform extends VoxaPlatform {
  public async execute(rawEvent: any, context: any): Promise<DialogFlowReply> {
    const event = new DialogFlowEvent(rawEvent, context);
    const voxaReply = await this.app.execute(event, new DialogFlowReply()) as DialogFlowReply;
    return voxaReply;
  }

  public getDirectiveHandlers() {
    return [
      List,
      Carousel,
      Suggestions,
      BasicCard,
    ];
  }
}
