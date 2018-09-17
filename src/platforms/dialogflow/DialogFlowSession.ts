import {
  Context,
  Contexts,
  DialogflowConversation,
  Parameters,
} from "actions-on-google";
import * as _ from "lodash";
import { IVoxaSession } from "../../VoxaEvent";

export class DialogFlowSession implements IVoxaSession {
  public attributes: any;
  public outputAttributes: object = {};
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

    const context: Context<Parameters>|undefined = this.contexts.attributes;
    if (!context) {
      return {};
    }

    if (_.isString(context.parameters.attributes)) {
      return JSON.parse(context.parameters.attributes);
    }

    if (_.isObject(context.parameters.attributes)) {
      return context.parameters.attributes;
    }

    return context.parameters.attributes;
  }
}
