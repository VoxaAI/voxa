import {
  Context,
  Contexts,
  DialogflowConversation,
  GoogleActionsV2AppRequest,
  GoogleActionsV2Conversation,
  GoogleCloudDialogflowV2Context,
  GoogleCloudDialogflowV2WebhookRequest,
  Parameters,
} from "actions-on-google";
import * as _ from "lodash";
import { IVoxaSession } from "../../VoxaEvent";

export class DialogFlowSession implements IVoxaSession {
  public attributes: any;
  public new: boolean;
  public sessionId: string;
  public contexts: Contexts;

  constructor(conv: DialogflowConversation) {
    this.contexts = conv.contexts.input;
    this.sessionId = conv.id;
    this.new = conv.type === "NEW";
    this.attributes = this.getAttributes(conv);
  }

  public getAttributes(conv: DialogflowConversation) {
    if (!this.contexts) {
      return {};
    }

    const context: Context<Parameters>|undefined = this.contexts.model;
    if (!context) {
      return {};
    }

    if (_.isString(context.parameters.model)) {
      return JSON.parse(context.parameters.model);
    }

    if (_.isObject(context.parameters.model)) {
      return context.parameters.model;
    }

    return context.parameters.model;
  }
}
