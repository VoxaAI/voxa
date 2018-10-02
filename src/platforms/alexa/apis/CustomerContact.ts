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
import { ApiBase } from "./ApiBase";

/**
 * CustomerContact API class reference
 * https://developer.amazon.com/docs/custom-skills/request-customer-contact-information-for-use-in-your-skill.html#get-customer-contact-information
 */
export class CustomerContact extends ApiBase {
  constructor(event: RequestEnvelope, log: LambdaLog) {
    super(event, log);

    this.tag = "CustomerContact";
    this.errorCodeSafeToIgnore = 403;
  }

  /**
   * Gets user's email address
   */
  public getEmail(): Promise<string> {
    return this.getResult("v2/accounts/~current/settings/Profile.email");
  }

  /**
   * Gets user's given name
   */
  public getGivenName(): Promise<string> {
    return this.getResult(
      "v2/accounts/~current/settings/Profile.givenName",
    ).catch((err: any) => this.checkError(err));
  }

  /**
   * Gets user's name
   */
  public getName(): Promise<string> {
    return this.getResult("v2/accounts/~current/settings/Profile.name").catch(
      (err: any) => this.checkError(err),
    );
  }

  /**
   * Gets user's phone number
   */
  public getPhoneNumber(): Promise<any> {
    return this.getResult("v2/accounts/~current/settings/Profile.mobileNumber");
  }

  /**
   * Gets user's full contact information
   */
  public async getFullUserInformation() {
    const infoRequests = [
      this.getEmail(),
      this.getGivenName(),
      this.getName(),
      this.getPhoneNumber(),
    ];

    const [email, givenName, name, phoneNumber] = await Promise.all(
      infoRequests,
    );
    const info = { email, givenName, name };

    return _.merge(info, phoneNumber);
  }
}
