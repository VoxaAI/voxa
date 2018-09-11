import {
  GoogleActionsV2AppResponse,
  GoogleCloudDialogflowV2Context,
  OutputContexts,
  RichResponse,
} from "actions-on-google";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IBag, IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";
import { DialogFlowEvent } from "./DialogFlowEvent";

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
      google: {
        expectUserResponse: true,
        isSsml: true,
      },
    };
  }

  public async saveSession(attributes: IBag, event: IVoxaEvent): Promise<void> {
    const dialogFlowEvent = event as DialogFlowEvent;
    const serializedData = JSON.stringify(attributes);
    dialogFlowEvent.google.conv.contexts.set("attributes", 10000, {
      attributes: serializedData,
    });

    this.outputContexts = dialogFlowEvent.google.conv.contexts._serialize();
  }

  public get speech() {
    return this.fulfillmentText;
  }

  public get hasMessages(): boolean {
    return this.fulfillmentText !== "";
  }

  public get hasDirectives(): boolean {
    // all system intents are directives
    if (this.payload.google.systemIntent) {
      return true;
    }

    const richResponse = this.payload.google.richResponse;
    if (!richResponse) {
      return false;
    }

    // any rich response item that's not a SimpleResponse counts as a directive
    const directives = _(richResponse.items)
      .map(_.values)
      .flatten()
      .map((item) => item.constructor.name)
      .pull("SimpleResponse")
      .value();

    return !!directives.length;
  }

  public get hasTerminated(): boolean {
    return !this.payload.google.expectUserResponse;
  }

  public clear() {
    delete this.payload.google.richResponse;
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
    if (!this.hasDirectives) {
      return false;
    }

    const richResponse = this.payload.google.richResponse;
    const systemIntent = this.payload.google.systemIntent;
    if (richResponse) {
      const directives = _(richResponse.items)
        .map(_.values)
        .flatten()
        .map((item) => item.constructor.name)
        .value();

      if (_.includes(directives, type)) {
        return true;
      }
    }

    if (systemIntent) {
      if (systemIntent.intent === type) {
        return true;
      }
    }

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
