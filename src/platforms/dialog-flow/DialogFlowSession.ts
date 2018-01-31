import { Context } from "actions-on-google/dialogflow-app";
import * as _ from "lodash";
import { IVoxaSession } from "../../VoxaEvent";

export class DialogFlowSession implements IVoxaSession {
  public attributes: any;
  public contexts: Context[];
  public new: boolean;
  public sessionId: string;

  constructor(rawEvent: any) {
    this.contexts = rawEvent.result.contexts;
    this.new = false;
    this.attributes = this.getAttributes();
    this.sessionId = ""; // TODO: fix this
  }

  public getAttributes() {
    if (!this.contexts) {
      return {};
    }
    const attributes = _(this.contexts)
      .map((context: any) => {
        const contextName = context.name;
        let contextParams: any;
        if (context.parameters[contextName]) {
          contextParams = context.parameters[contextName];
        } else {
          contextParams = context.parameters;
        }
        return [contextName, contextParams];
      })
      .fromPairs()
      .value();

    return attributes;
  }
}
