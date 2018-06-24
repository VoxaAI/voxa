import {
  DialogflowConversation,
  GoogleActionsV2Argument,
  GoogleActionsV2Input,
  GoogleCloudDialogflowV2OriginalDetectIntentRequest,
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import * as _ from "lodash";
import { IVoxaIntent } from "../../VoxaEvent";
import { StandardIntents } from "./interfaces";

export class DialogFlowIntent implements IVoxaIntent {
  public name: string;
  public params: any;
  public rawIntent: DialogflowConversation;

  constructor(conv: DialogflowConversation) {
    this.rawIntent = conv;
    console.log({
      action: conv.action,
      intent: conv.intent,
      query: conv.query,
    });
    this.name = conv.action;

    if (!this.name || this.name === "input.unknown") {
      this.name = conv.intent;
    }

    this.name = this.name.replace(/^AMAZON./, "");
    this.params = this.getParams();
  }

  public getParams(): any {
    const args = this.rawIntent.arguments.parsed.input;
    const input: any = {};
    if (this.rawIntent.input.type) {
      input[this.rawIntent.input.type] = this.rawIntent.input.raw;
    }

    const parameters = this.rawIntent.parameters;

    return _.merge({}, args, input, parameters);
  }
}
