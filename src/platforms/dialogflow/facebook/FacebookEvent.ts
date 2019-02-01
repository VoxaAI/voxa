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

import { Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext } from "azure-functions-ts-essentials";
import { LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import { v1 } from "uuid";
import { IVoxaUserProfile, VoxaEvent } from "../../../VoxaEvent";
import { FacebookIntent } from "./FacebookIntent";
import { FacebookSession } from "./FacebookSession";

export class FacebookEvent extends VoxaEvent {

  get supportedInterfaces(): string[] {
    // FACEBOOK MESSENGER DOES NOT HAVE SURFACES
    return [];
  }
  public rawEvent!: any;
  public session!: FacebookSession;
  public intent: FacebookIntent;
  public source: string = "facebook";

  constructor(
    rawEvent: any,
    logOptions?: LambdaLogOptions,
    executionContext?: AWSLambdaContext | AzureContext,
  ) {
    super(rawEvent, logOptions, executionContext);

    this.request = {
      locale: _.get(rawEvent.queryResult, "languageCode") || "",
      type: "IntentRequest",
    };

    this.intent = new FacebookIntent(rawEvent);
  }

  public async getUserInformation(): Promise<IVoxaUserProfile> {
    // TODO: RETURN USER'S FACEBOOK INFORMATION
    const userInformation: any = {};
    return userInformation;
  }

  protected initSession(): void {
    this.session = new FacebookSession(this.rawEvent);
  }

  protected initUser(): void {
    const { originalDetectIntentRequest } = this.rawEvent;
    const userId = _.get(originalDetectIntentRequest, "payload.data.sender.id");

    this.user = {
      id: userId,
      userId,
    };
  }
}
