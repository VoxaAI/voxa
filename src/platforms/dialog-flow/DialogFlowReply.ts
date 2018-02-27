import { Responses } from "actions-on-google";
import { Context } from "actions-on-google/dialogflow-app";
import { Model } from "../../Model";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";

export interface IDialogFlowData {
  google: {
    expectUserResponse: boolean;
    isSsml: boolean;
    noInputPrompts: string[];
    richResponse: Responses.RichResponse;
    possibleIntents?: any;
  };
}

export class DialogFlowReply implements IVoxaReply {
  public contextOut: Context[] = [];
  public speech: string = "";
  public source: string = "Voxa";
  public data: IDialogFlowData;

  constructor() {
    this.data = {
      google : {
        expectUserResponse: true,
        isSsml: true,
        noInputPrompts: [],
        richResponse: new Responses.RichResponse(),
      },
    };
  }

  public get hasMessages(): boolean {
    return this.speech !== "";
  }

  public get hasDirectives(): boolean {
    return false;
  }

  public get hasTerminated(): boolean {
    return !this.data.google.expectUserResponse;
  }

  public clear() {
    this.data.google.richResponse = new Responses.RichResponse();
    this.speech = "";
  }

  public terminate() {
    this.data.google.expectUserResponse = false;
  }

  public addStatement(statement: string) {
    this.speech = addToSSML(this.speech, statement);
    this.data.google.richResponse.addSimpleResponse(statement);
  }

  public hasDirective(type: string | RegExp): boolean {
    return false;
  }

  public addReprompt(reprompt: string) {
    this.data.google.noInputPrompts.push(reprompt);
  }

  public modelToSessionContext(model: Model): Context {
    const currentContext: Context = { name: "model", lifespan: 10000, parameters: {} };
    currentContext.parameters = model;
    return currentContext;
  }
}
