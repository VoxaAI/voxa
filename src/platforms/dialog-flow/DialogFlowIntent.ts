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
    } else if (rawEvent.queryResult.queryText === "actions_intent_COMPLETE_PURCHASE") {
      this.name = "actions.intent.COMPLETE_PURCHASE";
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

    const params = _.cloneDeep(this.rawIntent.queryResult.parameters) || {};
    const inputs: any[] = _.get(this.rawIntent, "originalDetectIntentRequest.payload.inputs") || [];
    const args = _(inputs)
      .map("arguments")
      .flatten()
      .filter()
      .map((rawArg: GoogleActionsV2Argument) => {
        const arg: any = {};
        if (!rawArg.name) {
          return;
        }

        arg[rawArg.name] = rawArg.extension ? rawArg.extension : rawArg;
        return arg;
      })
      .merge({})
      .value();

    _.forEach(args, (arg) => _.merge(params, arg));

    if (this.rawIntent.queryResult.queryText === "actions_intent_OPTION") {
      _.merge(params, getOptionsValue(this.rawIntent.originalDetectIntentRequest));
    }

    return params;
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
    MEDIA_STATUS: argument.extension,
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
    SIGN_IN: input.arguments[0].extension,
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
