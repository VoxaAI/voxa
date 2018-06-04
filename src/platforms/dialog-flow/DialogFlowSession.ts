import {
  GoogleActionsV2AppRequest,
  GoogleActionsV2Conversation,
  GoogleCloudDialogflowV2Context,
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import * as _ from "lodash";
import { IVoxaSession } from "../../VoxaEvent";

export class DialogFlowSession implements IVoxaSession {
  public attributes: any;
  public new: boolean;
  public sessionId: string;
  public user: any;
  public contexts: GoogleCloudDialogflowV2Context[];

  constructor(rawEvent: GoogleCloudDialogflowV2WebhookRequest) {
    const payload: GoogleActionsV2AppRequest = _.get(rawEvent, "originalDetectIntentRequest.payload");
    if (!payload.conversation) {
      throw new Error("Conversation is missing from request payload");
    }

    const conversation: GoogleActionsV2Conversation =  payload.conversation;
    this.contexts = _.get(rawEvent, "queryResult.outputContexts", []);
    this.sessionId = conversation.conversationId || "";
    this.user = payload.user;
    this.new = conversation.type === "NEW";
    this.attributes = this.getAttributes(rawEvent);
  }

  public getAttributes(rawEvent: any) {
    if (!this.contexts) {
      return {};
    }

    const context: GoogleCloudDialogflowV2Context|undefined = _.find(this.contexts, (c) =>
      c.name === `${rawEvent.session}/contexts/model`,
    );

    if (context && context.parameters && context.parameters.model) {
      return JSON.parse(context.parameters.model);
    }

    return {};

  }
}
