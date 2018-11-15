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

import { ResponseEnvelope } from "ask-sdk-model";
import * as _ from "lodash";
import { IBag, IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";

export class AlexaCanFullfillReply implements IVoxaReply, ResponseEnvelope {
  public version = "1.0";
  public response: any = {};
  public sessionAttributes: IBag = {};

  get hasMessages() {
    return false;
  }

  get hasDirectives() {
    return false;
  }

  get hasTerminated() {
    return true;
  }

  public async saveSession(attributes: IBag, event: IVoxaEvent): Promise<void> {
    this.sessionAttributes = attributes;
  }

  public terminate() {
    if (!this.response) {
      this.response = {};
    }
  }

  public get speech(): string {
    return _.get(this.response, "outputSpeech.ssml", "");
  }

  public get reprompt(): string {
    return _.get(this.response, "reprompt.outputSpeech.ssml", "");
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    return;
  }

  public addReprompt(statement: string, isPlain: boolean = false) {
    return;
  }

  public fulfillIntent(canFulfill: any) {
    _.set(this.response, "card", undefined);
    _.set(this.response, "reprompt", undefined);
    _.set(this.response, "outputSpeech", undefined);

    if (!_.includes(["YES", "NO", "MAYBE"], canFulfill)) {
      this.response.canFulfillIntent = { canFulfill: "NO" };
    } else {
      this.response.canFulfillIntent = { canFulfill };
    }
  }

  public fulfillSlot(slotName: string, canUnderstand: any, canFulfill: any) {
    if (!_.includes(["YES", "NO", "MAYBE"], canUnderstand)) {
      canUnderstand = "NO";
    }

    if (!_.includes(["YES", "NO"], canFulfill)) {
      canFulfill = "NO";
    }

    this.response.canFulfillIntent = this.response.canFulfillIntent || {
      canFulfill: "NO",
    };
    this.response.canFulfillIntent.slots =
      this.response.canFulfillIntent.slots || {};

    this.response.canFulfillIntent.slots[slotName] = {
      canFulfill,
      canUnderstand,
    };
  }

  public clear() {
    this.response = {};
  }

  public hasDirective(type: string | RegExp): boolean {
    return false;
  }
}
