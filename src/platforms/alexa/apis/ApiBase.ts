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

import { RequestEnvelope } from "ask-sdk-model";
import { LambdaLog } from "lambda-log";
import * as _ from "lodash";
import * as rp from "request-promise";

export class ApiBase {
  public errorCodeSafeToIgnore: number = 0; // the code error to ignore on checkError function
  public tag: string = ""; // the class reference for error logging
  public rawEvent: RequestEnvelope; // the event as sent by the service

  constructor(event: RequestEnvelope, public log: LambdaLog) {
    this.rawEvent = _.cloneDeep(event);
  }

  protected getResult(path = "", method = "GET", body = {}) {
    const options = {
      body,
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      json: true, // Automatically parses the JSON string in the response
      method,
      uri: `${this.getEndpoint()}/${path}`,
    };

    return Promise.resolve(rp(options));
  }

  protected checkError(error: any) {
    this.log.debug("error", {
      error,
      tag: this.tag,
    });

    if (
      error.statusCode === this.errorCodeSafeToIgnore ||
      error.error.code === this.errorCodeSafeToIgnore
    ) {
      return undefined;
    }

    throw error;
  }

  protected getToken() {
    return _.get(this.rawEvent, "context.System.apiAccessToken");
  }

  protected getEndpoint() {
    return _.get(this.rawEvent, "context.System.apiEndpoint");
  }
}
