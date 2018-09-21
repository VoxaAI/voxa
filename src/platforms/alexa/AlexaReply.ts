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

import { Response, ResponseEnvelope } from "ask-sdk-model";
import * as _ from "lodash";
import { IBag, IVoxaEvent } from "../../VoxaEvent";
import { addToSSML, IVoxaReply } from "../../VoxaReply";

export class AlexaReply implements IVoxaReply, ResponseEnvelope {
  public version = "1.0";
  public response: Response = {};
  public sessionAttributes: IBag = {};

  get hasMessages() {
    return !!this.response.outputSpeech;
  }

  get hasDirectives() {
    if (this.response.card) {
      return true;
    }

    if (!!this.response.directives) {
      return true;
    }

    return false;
  }

  get hasTerminated() {
    return !!this.response && !!this.response.shouldEndSession;
  }

  public async saveSession(attributes: IBag, event: IVoxaEvent): Promise<void> {
    this.sessionAttributes = attributes;
  }

  public terminate() {
    if (!this.response) {
      this.response = {};
    }

    if (
      !this.hasDirective("VideoApp.Launch") &&
      !this.hasDirective("GameEngine.StartInputHandler")
    ) {
      this.response.shouldEndSession = true;
    }
  }

  public get speech(): string {
    return _.get(this.response, "outputSpeech.ssml", "");
  }

  public get reprompt(): string {
    return _.get(this.response, "reprompt.outputSpeech.ssml", "");
  }

  public addStatement(statement: string, isPlain: boolean = false) {
    if (!("shouldEndSession" in this.response)) {
      this.response.shouldEndSession = false;
    }

    let ssml: string = _.get(
      this.response,
      "outputSpeech.ssml",
      "<speak></speak>",
    );
    ssml = addToSSML(ssml, statement);
    this.response.outputSpeech = {
      ssml,
      type: "SSML",
    };
  }

  public addReprompt(statement: string, isPlain: boolean = false) {
    const type = "SSML";
    let ssml: string = _.get(
      this.response.reprompt,
      "outputSpeech.ssml",
      "<speak></speak>",
    );
    ssml = addToSSML(ssml, statement);
    this.response.reprompt = {
      outputSpeech: {
        ssml,
        type,
      },
    };
  }

  public fulfillIntent(canFulfill: any) {
    this.response.card = undefined;
    this.response.reprompt = undefined;
    this.response.outputSpeech = undefined;

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
    if (!this.hasDirectives) {
      return false;
    }

    let allDirectives: any[] = this.response.directives || [];
    if (this.response.card) {
      allDirectives = _.concat(allDirectives, {
        card: this.response.card,
        type: "card",
      });
    }

    return allDirectives.some((directive: any) => {
      if (_.isRegExp(type)) {
        return !!type.exec(directive.type);
      }

      if (_.isString(type)) {
        return type === directive.type;
      }

      throw new Error(
        `Do not know how to use a ${typeof type} to find a directive`,
      );
    });
  }
}
