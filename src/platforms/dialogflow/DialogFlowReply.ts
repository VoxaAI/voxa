import {
  GoogleActionsV2SimpleResponse,
  GoogleCloudDialogflowV2Context,
  RichResponse,
  SimpleResponse,
} from "actions-on-google";
import { DialogflowConversation } from "actions-on-google";
import * as _ from "lodash";
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
    userStorage: any;
    resetUserStorage?: true;
  };
}

export class DialogFlowReply implements IVoxaReply {
  public outputContexts: GoogleCloudDialogflowV2Context[] = [];
  public fulfillmentText: string = "";
  public source: string = "google";
  public payload: IDialogFlowPayload;

  constructor(conv: DialogflowConversation) {
    this.payload = {
      google: {
        expectUserResponse: true,
        isSsml: true,
        userStorage: conv.user.storage,
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
    const directives = this.getRichResponseDirectives();
    return !!_.pull(directives, "SimpleResponse").length;
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

  public addStatement(statement: string, isPlain: boolean = false) {
    this.fulfillmentText = addToSSML(this.fulfillmentText, statement);
    const richResponse = this.payload.google.richResponse || new RichResponse();
    const simpleResponseItem = _.find(
      richResponse.items,
      (item) => !!item.simpleResponse,
    );
    let text: string;
    let speech: string;

    if (!simpleResponseItem) {
      speech = addToSSML("", statement);
      if (isPlain) {
        text = statement;
        richResponse.add(new SimpleResponse({ speech, text }));
      } else {
        richResponse.add(speech);
      }
    } else if (simpleResponseItem.simpleResponse) {
      const simpleResponse: GoogleActionsV2SimpleResponse =
        simpleResponseItem.simpleResponse;

      if (isPlain) {
        simpleResponse.displayText = addToText(
          simpleResponse.displayText,
          statement,
        );
      } else {
        simpleResponse.textToSpeech = addToSSML(
          simpleResponse.textToSpeech,
          statement,
        );
      }
    }

    this.payload.google.richResponse = richResponse;
  }

  public hasDirective(type: string | RegExp): boolean {
    if (!this.hasDirectives) {
      return false;
    }

    const richResponseDirectives = this.getRichResponseDirectives();
    if (_.includes(richResponseDirectives, type)) {
      return true;
    }

    const systemIntent = this.payload.google.systemIntent;
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

  protected getRichResponseDirectives(): string[] {
    const richResponse = this.payload.google.richResponse;
    if (!richResponse) {
      return [];
    }

    return _(richResponse.items)
      .map(_.values)
      .flatten()
      .map((item) => item.constructor.name)
      .value();
  }
}
