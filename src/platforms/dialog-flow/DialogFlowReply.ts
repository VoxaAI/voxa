import { GoogleCloudDialogflowV2Context, RichResponse } from "actions-on-google";
import { Model } from "../../Model";
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
    conversationToken?: string;
  };
}

export class DialogFlowReply implements IVoxaReply {
  public outputContexts: GoogleCloudDialogflowV2Context[] = [];
  public fulfillmentText: string = "";
  public source: string = "Voxa";
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
