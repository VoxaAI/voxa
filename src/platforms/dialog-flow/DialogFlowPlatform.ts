import { VoxaPlatform } from "../VoxaPlatform";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";

export class DialogFlowPlatform extends VoxaPlatform {
  public async execute(rawEvent: any, context: any): Promise<any> {
    const event = new DialogFlowEvent(rawEvent, context);
    const voxaReply = await this.app.execute(event, new DialogFlowReply());
    return voxaReply;
  }
}
