import { GoogleCloudDialogflowV2Context } from "actions-on-google";
import * as _ from "lodash";
import { IVoxaSession } from "../../VoxaEvent";

export class DialogFlowSession implements IVoxaSession {
  public attributes: any;
  public contexts: GoogleCloudDialogflowV2Context[];
  public new: boolean;
  public sessionId: string;
  public user: any;

  constructor(rawEvent: any) {
    this.contexts = rawEvent.queryResult.outputContexts;
    this.new = false;
    this.sessionId = rawEvent.session;
    this.user = this.getUser(rawEvent);
    this.attributes = this.getAttributes(rawEvent);
  }

  public getUser(rawEvent: any) {
    return _.get(rawEvent, "originalDetectIntentRequest.data.user", {});
  }

  public getAttributes(rawEvent: any) {
    if (!this.contexts) {
      return {};
    }

    const context: GoogleCloudDialogflowV2Context|undefined = _.find(this.contexts, {
      name: `${this.sessionId}/contexts/model`,
    });

    if (context && context.parameters && context.parameters.model) {
      return JSON.parse(context.parameters.model);
    }

    return  {};
  }
}
