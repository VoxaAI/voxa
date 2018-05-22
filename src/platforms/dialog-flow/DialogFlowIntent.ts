import { GoogleActionsV2Argument } from "actions-on-google";
import * as _ from "lodash";
import { IVoxaIntent } from "../../VoxaEvent";
import { StandardIntents } from "./interfaces";

export class DialogFlowIntent implements IVoxaIntent {
  public name: string;
  public rawIntent: any;
  public params: any;

  constructor(rawEvent: any) {
    this.rawIntent = rawEvent;

    if (rawEvent.queryResult.resolvedQuery === "actions_intent_OPTION") {
      this.name = "actions.intent.OPTION";
    } else {
      this.name = rawEvent.queryResult.intent.displayName;
    }

    this.name = this.name.replace(/^AMAZON./, "");
    this.params = this.getParams();
  }

  public getParams(): any {
    if (this.rawIntent.queryResult.queryText === "actions_intent_OPTION") {
      return getOptionsValue(this.rawIntent);
    }

    if (this.rawIntent.queryResult.queryText === "actions_intent_SIGN_IN") {
      return getSiginStatus(this.rawIntent);
    }

    return this.rawIntent.queryResult.parameters;
  }
}

function getSiginStatus(rawIntent: any): any {
  const input: any = _.find(rawIntent.originalDetectIntentRequest.payload.inputs, { intent: StandardIntents.SIGN_IN });
  if (!input) {
    return {};
  }

  return {
    signin: {
      status: input.arguments[0].extension.status,
    },
  };
}

function getOptionsValue(rawIntent: any): any {
  const input: any = _.find(rawIntent.originalDetectIntentRequest.payload.inputs, { intent: StandardIntents.OPTION });

  if (!input) {
    return {};
  }

  const args = _(input.arguments)
    .map((argument: GoogleActionsV2Argument) => [argument.name, argument.textValue])
    .fromPairs()
    .value();

  return args;
}
