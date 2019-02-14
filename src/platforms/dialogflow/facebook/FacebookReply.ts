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
import { IBag, IVoxaEvent } from "../../../VoxaEvent";
import { addToSSML, addToText, IVoxaReply } from "../../../VoxaReply";
import { DialogflowReply, IDialogflowPayload } from "../DialogflowReply";
import { FacebookEvent } from "./FacebookEvent";

export interface IFacebookPayload extends IDialogflowPayload {
  facebook: {
    attachment?: {
      payload: any;
      type: string;
    };
    quick_replies?: any[];
    text?: any;
  };
}

export class FacebookReply extends DialogflowReply {

  public get speech(): string {
    return this.payload.facebook.text || this.fulfillmentText;
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
  public payload: IFacebookPayload;
  public source: string = "facebook";

  constructor(event: FacebookEvent) {
    super();
    this.payload = {
      facebook: {},
    };
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
    const quickRepliesKeys: string[] = _.map(this.payload.facebook.quick_replies, "content_type");
    const templateType: string = _.get(this.payload.facebook, "attachment.payload.template_type");

    return _.chain(quickRepliesKeys)
      .concat(templateType)
      .uniq()
      .compact()
      .value();
  }
}
