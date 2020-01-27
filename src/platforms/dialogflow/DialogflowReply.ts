/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  GoogleActionsV2SimpleResponse,
  GoogleCloudDialogflowV2Context,
  RichResponse,
  SimpleResponse,
} from "actions-on-google";
import * as _ from "lodash";
import { IBag, IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../VoxaReply";
import { DialogflowEvent } from "./DialogflowEvent";

export interface IDialogflowPayload {
  facebook?: any;
  google?: any;
}

export interface IGooglePayload extends IDialogflowPayload {
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

export interface ISessionEntityType {
  name: string;
  entities: IEntity[];
  entityOverrideMode: string;
}

export interface IEntity {
  value: string;
  synonyms: string[];
}

export class DialogflowReply implements IVoxaReply {
  public outputContexts: GoogleCloudDialogflowV2Context[] = [];
  public fulfillmentMessages?: any[];
  public fulfillmentText: string = "";
  public source: string = "google";
  public payload: IDialogflowPayload;
  public sessionEntityTypes: ISessionEntityType[];

  constructor() {
    this.payload = {
      google: {
        expectUserResponse: true,
        isSsml: true,
        userStorage: {},
      },
    };
    this.sessionEntityTypes = [];
  }

  public async saveSession(attributes: IBag, event: IVoxaEvent): Promise<void> {
    const dialogflowEvent = event as DialogflowEvent;
    const serializedData = JSON.stringify(attributes);
    dialogflowEvent.dialogflow.conv.contexts.set("attributes", 10000, {
      attributes: serializedData,
    });

    this.outputContexts = dialogflowEvent.dialogflow.conv.contexts._serialize();
  }

  public get speech(): string {
    const richResponse = this.payload.google.richResponse;
    if (!richResponse) {
      return "";
    }

    return _(richResponse.items)
      .filter((item) => !!item.simpleResponse)
      .map("simpleResponse.textToSpeech")
      .value()
      .join("\n");
  }

  public get hasMessages(): boolean {
    return !!this.getSimpleResponse().textToSpeech;
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
    const simpleResponse: GoogleActionsV2SimpleResponse = this.getSimpleResponse();

    if (isPlain) {
      this.fulfillmentText = addToText(this.fulfillmentText, statement);
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

  protected getSimpleResponse(): GoogleActionsV2SimpleResponse {
    const richResponse = this.payload.google.richResponse || new RichResponse();
    this.payload.google.richResponse = richResponse;

    const simpleResponseItem = _.findLast(
      richResponse.items,
      (item) => !!item.simpleResponse,
    );

    if (simpleResponseItem && simpleResponseItem.simpleResponse) {
      return simpleResponseItem.simpleResponse;
    }

    const simpleResponse = new SimpleResponse("");

    richResponse.add(simpleResponse);

    return simpleResponse;
  }
}
