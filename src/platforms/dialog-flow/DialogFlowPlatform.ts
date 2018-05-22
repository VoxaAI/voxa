import { GoogleCloudDialogflowV2Context  } from "actions-on-google";
import * as _ from "lodash";
import { Model } from "../../Model";
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
    voxaReply.outputContexts =     await this.modelToSessionContext(event);

    return voxaReply;
  }

  public async modelToSessionContext(event: DialogFlowEvent): Promise<GoogleCloudDialogflowV2Context[]> {
    const modelContext: GoogleCloudDialogflowV2Context = {
      lifespanCount: 100000,
      name: `${event.session.sessionId}/contexts/model`,
      parameters: {},
    };

    modelContext.parameters = {
      model: JSON.stringify(await event.model.serialize()),
    };

    const currentContexts = event.rawEvent.queryResult.outputContexts || [];
    const outputContexts = _.filter(currentContexts, (context) => context.name !== modelContext.name);

    outputContexts.push(modelContext);

    return outputContexts;
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
