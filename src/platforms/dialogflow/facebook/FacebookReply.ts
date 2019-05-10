/*
 * Copyright (c) 2019 Rain Agency <contact@rain.agency>
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
import { addToText } from "../../../VoxaReply";
import { DialogflowReply, IDialogflowPayload } from "../DialogflowReply";

export interface IFacebookPayload extends IDialogflowPayload {
  payload: {
    facebook: {
      attachment?: {
        payload: any;
        type: string;
      };
      quick_replies?: any[];
      text?: any;
    };
  };
}

export class FacebookReply extends DialogflowReply {
  public fulfillmentMessages: IFacebookPayload[] = [];

  public get speech(): string {
    return this.fulfillmentText;
  }

  public get hasDirectives(): boolean {
    const directives = this.getResponseDirectives();

    return !_.isEmpty(directives);
  }

  public get hasMessages(): boolean {
    return !!this.fulfillmentText;
  }

  public get hasTerminated(): boolean {
    // WE CAN'T TERMINATE A SESSION IN FACEBOOK MESSENGER
    return false;
  }
  public fulfillmentText: string = "";
  public source: string = "facebook";

  constructor() {
    super();
    _.unset(this, "payload");
  }

  public clear() {
    this.fulfillmentMessages = [];
    this.fulfillmentText = "";
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    if (isPlain) {
      this.fulfillmentText = addToText(this.fulfillmentText, statement);

      const customFacebookPayload = {
        payload: {
          facebook: {
            text: statement,
          },
        },
      };

      this.fulfillmentMessages.push(customFacebookPayload);
    }
  }

  public hasDirective(type: string | RegExp): boolean {
    if (!this.hasDirectives) {
      return false;
    }

    const responseDirectives = this.getResponseDirectives();
    if (_.includes(responseDirectives, type)) {
      return true;
    }

    return false;
  }

  public addReprompt(reprompt: string) {
    // FACEBOOK MESSENGER DOES NOT USE REPROMPTS
  }

  public terminate() {
    // WE CAN'T TERMINATE A SESSION IN FACEBOOK MESSENGER
  }

  protected getResponseDirectives(): string[] {
    const responseDirectives = _.map(this.fulfillmentMessages, (message) => {
      const quickRepliesKeys: string[] = _.map(message.payload.facebook.quick_replies, "content_type");
      const templateType: string = _.get(message.payload.facebook, "attachment.payload.template_type");

      return _.chain(quickRepliesKeys)
        .concat(templateType)
        .uniq()
        .compact()
        .value();
    });

    return _.flattenDeep(responseDirectives) as string[];
  }
}
