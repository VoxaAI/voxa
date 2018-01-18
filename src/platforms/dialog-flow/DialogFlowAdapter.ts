import * as _ from "lodash";

import { directiveHandler } from "../../directives";
import { VoxaApp } from "../../VoxaApp";
import { VoxaReply } from "../../VoxaReply";
import { VoxaAdapter } from "../VoxaAdapter";
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import { BasicCard, Carousel, List, Suggestions } from "./directives";

export class DialogFlowAdapter extends VoxaAdapter<DialogFlowReply> {
  constructor(voxaApp: VoxaApp) {
    super(voxaApp);
    _.map([List, Carousel, Suggestions, BasicCard],
      (handler: (value: any) => directiveHandler) => voxaApp.registerDirectiveHandler(handler, handler.name));
  }

  public async execute(rawEvent: any, context: any): Promise<any> {
    const event = new DialogFlowEvent(rawEvent, context);
    const voxaReply = await this.app.execute(event, DialogFlowReply);
    return voxaReply.toJSON();
  }

}
