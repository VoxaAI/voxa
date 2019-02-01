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

import * as _ from "lodash";
import { IBag, IVoxaEvent } from "../../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../../VoxaReply";
import { FacebookEvent } from "./FacebookEvent";
import { FacebookSession, IFacebookContext } from "./FacebookSession";

export interface IFacebookPayload {
  facebook: {
    attachment?: {
      payload: any;
      type: string;
    };
    quick_replies?: any[];
    text?: any;
  };
}

export class FacebookReply implements IVoxaReply {
  public fulfillmentText: string = "";
  public source: string = "facebook";
  public outputContexts: IFacebookContext[];
  public payload: IFacebookPayload;

  constructor(event: FacebookEvent) {
    this.payload = {
      facebook: {},
    };

    this.outputContexts = event.session.contexts;
  }

  public async saveSession(attributes: IBag, event: IVoxaEvent): Promise<void> {
    const serializedData = JSON.stringify(attributes);
    let sessionContext = _.find(this.outputContexts,
      (x) => _.endsWith(x.name, "attributes"));

    if (!sessionContext) {
      sessionContext = {
        lifespanCount: 10000,
        name: `${event.session.sessionId}/contexts/attributes`,
        parameters: {
          attributes: serializedData,
        },
      };

      this.outputContexts.push(sessionContext);
    } else {
      sessionContext.parameters.attributes = serializedData;
    }
  }

  public get speech(): string {
    return this.payload.facebook.text || this.fulfillmentText;
  }

  public get hasMessages(): boolean {
    return !!this.fulfillmentText;
  }

  public clear() {
    delete this.payload.facebook.attachment;
    delete this.payload.facebook.quick_replies;
    delete this.payload.facebook.text;

    this.fulfillmentText = "";
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    if (isPlain) {
      this.fulfillmentText = addToText(this.fulfillmentText, statement);
      this.payload.facebook.text = this.fulfillmentText;
    }
  }

  public addReprompt(reprompt: string) {
    // FACEBOOK MESSENGER DOES NOT USE REPROMPTS
  }

  public hasDirective(type: string | RegExp): boolean {
    // FACEBOOK MESSENGER DOES NOT USE SURFACES
    return false;
  }

  public get hasDirectives(): boolean {
    // FACEBOOK MESSENGER DOES NOT USE SURFACES
    return false;
  }

  public get hasTerminated(): boolean {
    // WE CAN'T TERMINATE A SESSION IN FACEBOOK MESSENGER
    return false;
  }

  public terminate() {
    // WE CAN'T TERMINATE A SESSION IN FACEBOOK MESSENGER
  }
}
