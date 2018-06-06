import { GoogleActionsV2AppResponse, GoogleCloudDialogflowV2Context, RichResponse } from "actions-on-google";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";

export interface IDialogFlowPayload {
  google: {
    expectUserResponse: boolean;
    noInputPrompts?: any[];
    richResponse?: RichResponse;
    possibleIntents?: any;
    expectedInputs?: any;
    inputPrompt?: any;
    systemIntent?: any;
    isSsml?: boolean;
  };
}

export class DialogFlowReply implements IVoxaReply {
  public outputContexts: GoogleCloudDialogflowV2Context[] = [];
  public fulfillmentText: string = "";
  public source: string = "google";
  public payload: IDialogFlowPayload;

  constructor() {
    this.payload = {
      google : {
        expectUserResponse: true,
        isSsml: true,
        noInputPrompts: [],
        richResponse: new RichResponse(),
      },
    };
  }

  public async saveSession(event: IVoxaEvent): Promise<void> {
    const serializedData = JSON.stringify(await event.model.serialize());
    const modelContext: GoogleCloudDialogflowV2Context = {
      lifespanCount: 100000,
      name: `${event.rawEvent.session}/contexts/model`,
      parameters: {},
    };

    modelContext.parameters = {
      model: JSON.stringify(await event.model.serialize()),
    };

    const currentContexts = event.rawEvent.queryResult.outputContexts || [];
    const outputContexts = _.filter(currentContexts, (context) => context.name !== modelContext.name);

    outputContexts.push(modelContext);

    this.outputContexts = outputContexts;
  }

  public get speech() {
    return this.fulfillmentText;
  }

  public get hasMessages(): boolean {
    return this.fulfillmentText !== "";
  }

  public get hasDirectives(): boolean {
    return false;
  }

  public get hasTerminated(): boolean {
    return !this.payload.google.expectUserResponse;
  }

  public clear() {
    this.payload.google.richResponse = new RichResponse();
    this.payload.google.noInputPrompts = [];
    this.fulfillmentText = "";
  }

  public terminate() {
    this.payload.google.expectUserResponse = false;
  }

  public addStatement(statement: string) {
    this.fulfillmentText = addToSSML(this.fulfillmentText, statement);
    const richResponse = this.payload.google.richResponse || new RichResponse();
    richResponse.add(addToSSML("", statement));

    this.payload.google.richResponse = richResponse;
  }

  public hasDirective(type: string | RegExp): boolean {
    return false;
  }

  public addReprompt(reprompt: string) {
    const noInputPrompts = this.payload.google.noInputPrompts || [];
    noInputPrompts.push({
      textToSpeech: reprompt,
    });

    this.payload.google.noInputPrompts = noInputPrompts;
  }

}
