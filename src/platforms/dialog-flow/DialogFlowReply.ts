import { Responses } from "actions-on-google";
import { Context } from "actions-on-google/dialogflow-app";
import { Model } from "../../Model";
import { IVoxaReply } from "../../VoxaReply";

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
    return false;
  }

  public get hasDirectives(): boolean {
    return false;
  }

  public get hasTerminated(): boolean {
    return false;
  }

  public clear() {
    throw new Error("Not Implemented");
  }

  public terminate() {
    throw new Error("Not Implemented");
  }

  public addStatement() {
    throw new Error("Not Implemented");
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
