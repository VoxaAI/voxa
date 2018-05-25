import {
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
  public rawIntent: GoogleCloudDialogflowV2WebhookRequest;
  public params: any;

  constructor(rawEvent: GoogleCloudDialogflowV2WebhookRequest) {
    this.rawIntent = rawEvent;

    if (!rawEvent.queryResult) {
      throw new Error("Missing rawEvent.queryResult");
    }

    if (rawEvent.queryResult.queryText === "actions_intent_OPTION") {
      this.name = "actions.intent.OPTION";
    } else if (rawEvent.queryResult.queryText === "actions_intent_MEDIA_STATUS") {
      this.name = "actions.intent.MEDIA_STATUS";
    } else {
      if (!rawEvent.queryResult.intent || !rawEvent.queryResult.intent.displayName) {
        throw new Error("Missing rawEvent.queryResult.intent.displayName");
      }

      this.name = rawEvent.queryResult.intent.displayName;
    }

    this.name = this.name.replace(/^AMAZON./, "");
    this.params = this.getParams();
  }

  public getParams(): any {
    if (!this.rawIntent.queryResult) {
      throw new Error("queryResult is missing");
    }

    if (this.rawIntent.queryResult.queryText === "actions_intent_OPTION") {
      return getOptionsValue(this.rawIntent.originalDetectIntentRequest);
    }

    if (this.rawIntent.queryResult.queryText === "actions_intent_SIGN_IN") {
      return getSiginStatus(this.rawIntent.originalDetectIntentRequest);
    }

    if (this.rawIntent.queryResult.queryText === "actions_intent_MEDIA_STATUS") {
      return getMediaStatus(this.rawIntent.originalDetectIntentRequest);
    }

    return this.rawIntent.queryResult.parameters;
  }
}

function getMediaStatus(intentRequest: GoogleCloudDialogflowV2OriginalDetectIntentRequest|undefined) {
  if (!intentRequest || !intentRequest.payload) {
    throw new Error("payload missing");
  }

  const input = _.find(intentRequest.payload.inputs, { intent: "actions.intent.MEDIA_STATUS" }) as GoogleActionsV2Input;
  if (!input || !input.arguments || !input.arguments[0]) {
    return {};
  }

  const argument = input.arguments[0];

  if (!argument.extension) {
    return {};
  }

  return {
    signin: {
      status: argument.extension.status,
    },
  };

}

function getSiginStatus(intentRequest: GoogleCloudDialogflowV2OriginalDetectIntentRequest|undefined): any {
  if (!intentRequest || !intentRequest.payload) {
    throw new Error("payload missing");
  }

  const input: any = _.find(intentRequest.payload.inputs, { intent: StandardIntents.SIGN_IN });
  if (!input) {
    return {};
  }

  return {
    signin: {
      status: input.arguments[0].extension.status,
    },
  };
}

function getOptionsValue(intentRequest: GoogleCloudDialogflowV2OriginalDetectIntentRequest|undefined): any {
  if (!intentRequest || !intentRequest.payload) {
    throw new Error("payload missing");
  }

  const input: any = _.find(intentRequest.payload.inputs, { intent: StandardIntents.OPTION });

  if (!input) {
    return {};
  }

  const args = _(input.arguments)
    .map((argument: GoogleActionsV2Argument) => [argument.name, argument.textValue])
    .fromPairs()
    .value();

  return args;
}
