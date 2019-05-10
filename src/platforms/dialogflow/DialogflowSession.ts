import {
  Context,
  Contexts,
  DialogflowConversation,
  Parameters,
} from "actions-on-google";
import * as _ from "lodash";
import { IBag, IVoxaSession } from "../../VoxaEvent";

export class DialogflowSession implements IVoxaSession {
  public attributes: IBag;
  public outputAttributes: IBag = {};
  public new: boolean;
  public sessionId: string;
  public contexts: Contexts;

  constructor(conv: DialogflowConversation) {
    this.contexts = conv.contexts.input;
    this.sessionId = conv.id;
    this.new = conv.type === "NEW";
    this.attributes = this.getAttributes(conv);
  }

  private getAttributes(conv: DialogflowConversation) {
    const context: Context<Parameters> | undefined = this.contexts.attributes;
    if (!context) {
      return {};
    }

    if (_.isString(context.parameters.attributes)) {
      return JSON.parse(context.parameters.attributes);
    }

    return context.parameters.attributes;
  }
}
