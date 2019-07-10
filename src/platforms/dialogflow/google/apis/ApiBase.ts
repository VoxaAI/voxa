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

import {
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import { google as googleapis } from "googleapis";
import { LambdaLog } from "lambda-log";
import * as _ from "lodash";

import { ITransactionOptions } from "./ITransactionOptions";

export class ApiBase {
  public tag: string = ""; // the class reference for error logging
  public rawEvent: GoogleCloudDialogflowV2WebhookRequest; // the event as sent by the service

  constructor(
    event: GoogleCloudDialogflowV2WebhookRequest,
    public log: LambdaLog,
    public transactionOptions?: ITransactionOptions,
  ) {
    this.rawEvent = _.cloneDeep(event);
  }

  /**
   * Gets Google's Credentials: access_token, refresh_token, expiration_date, token_type
   */
  protected async getCredentials(): Promise<any> {
    const key = _.get(this, "transactionOptions.key");
    const keyFile = _.get(this, "transactionOptions.keyFile");

    if (!keyFile && !key) {
      throw new Error("keyFile for transactions missing");
    }

    try {
      const scopes = ["https://www.googleapis.com/auth/actions.purchases.digital"];
      let client;

      if (key) {
        client = new googleapis.auth.JWT(
          key.client_email,
          undefined,
          key.private_key,
          scopes,
          undefined,
        );
      } else {
        const params = {
          keyFile,
          scopes,
        };

        client = new googleapis.auth.JWT(params);
      }

      const result = await client.authorize();

      return result;
    } catch (error) {
      this.log.debug("error", {
        error,
        tag: this.tag,
      });

      throw error;
    }
  }
}
