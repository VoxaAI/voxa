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
  DialogflowConversation,
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import { Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext } from "azure-functions-ts-essentials";
import { LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import { v1 } from "uuid";
import { VoxaEvent } from "../../VoxaEvent";
import { DialogFlowIntent } from "./DialogFlowIntent";
import { DialogFlowSession } from "./DialogFlowSession";

export class DialogFlowEvent extends VoxaEvent {
  public rawEvent!: GoogleCloudDialogflowV2WebhookRequest;
  public session!: DialogFlowSession;
  public google!: { conv: DialogflowConversation };
  public intent: DialogFlowIntent;

  constructor(
    rawEvent: GoogleCloudDialogflowV2WebhookRequest,
    logOptions?: LambdaLogOptions,
    executionContext?: AWSLambdaContext | AzureContext,
  ) {
    super(rawEvent, logOptions, executionContext);

    this.request = {
      locale: _.get(rawEvent.queryResult, "languageCode") || "",
      type: "IntentRequest",
    };

    this.intent = new DialogFlowIntent(this.google.conv);
  }

  protected initSession(): void {
    this.google = {
      conv: new DialogflowConversation({
        body: this.rawEvent,
        headers: {},
      }),
    };
    this.session = new DialogFlowSession(this.google.conv);
  }

  /**
   * conv.user.id is a deprecated feature that will be removed soon
   * this makes it so skills using voxa are future proof
   *
   * We use conv.user.id if it's available, but we store it in userStorage,
   * If there's no conv.user.id we generate a uuid.v1 and store it in userStorage
   *
   * After that we'll default to the userStorage value
   */
  protected initUser(): void {
    const { conv } = this.google;
    const storage = conv.user.storage as any;
    let userId: string;

    if (_.get(storage, "voxa.userId")) {
      userId = storage.voxa.userId;
    } else if (conv.user.id) {
      userId = conv.user.id;
    } else {
      userId = v1();
    }

    storage.voxa = { userId };

    this.user = {
      accessToken: conv.user.access.token,
      id: userId,
      userId,
    };

    conv.user.storage = storage;
  }

  get supportedInterfaces(): string[] {
    let capabilities = _.map(
      this.google.conv.surface.capabilities.list,
      "name",
    );
    capabilities = _.filter(capabilities);

    return capabilities as string[];
  }
}
