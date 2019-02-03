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

/**
 * Events Builder class reference
 */
export class EventBuilder {
  private expiryTime: string = "";
  private timestamp: string = "";
  private localizedAttributes: any[] = [];
  private name: string|undefined;
  private payload: any = {};
  private referenceId: string = "";
  private relevantAudience: any = {};

  constructor(name?: string) {
    this.name = name;
  }

  public addContent(locale: string, localizedKey: string, localizedValue: string): EventBuilder {
    this.localizedAttributes = this.localizedAttributes || [];

    let item: any = _.find(this.localizedAttributes, (x) => x.locale === locale);

    if (!item) {
      item = { locale };
      item[localizedKey] = localizedValue;
      this.localizedAttributes.push(item);
    } else {
      item[localizedKey] = localizedValue;
    }

    return this;
  }

  /*
   * expiryTime must be in GMT
   */
  public setExpiryTime(expiryTime: string): EventBuilder {
    this.expiryTime = expiryTime;

    return this;
  }

  public setPayload(payload: any): EventBuilder {
    this.payload = payload;

    return this;
  }

  public setReferenceId(referenceId: string): EventBuilder {
    this.referenceId = referenceId;

    return this;
  }

  public setMulticast(): EventBuilder {
    this.relevantAudience = {
      payload: {},
      type: "Multicast",
    };

    return this;
  }

  /*
   * timestamp must be in GMT
   */
  public setTimestamp(timestamp: string): EventBuilder {
    this.timestamp = timestamp;

    return this;
  }

  public setUnicast(userId: string): EventBuilder {
    this.relevantAudience = {
      payload: { user: userId },
      type: "Unicast",
    };

    return this;
  }

  public getPayload() {
    return this.payload;
  }

  public build(): any {
    return {
      event: {
        name: this.name,
        payload: this.getPayload(),
      },
      expiryTime: this.expiryTime,
      localizedAttributes: this.localizedAttributes,
      referenceId: this.referenceId,
      relevantAudience: this.relevantAudience,
      timestamp: this.timestamp,
    };
  }
}
