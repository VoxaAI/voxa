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
import * as rp from "request-promise";

import { AuthenticationBase } from "./AuthenticationBase";

export class ProactiveEvents extends AuthenticationBase {
  /**
   * Creates proactive event
   * https://developer.amazon.com/docs/smapi/proactive-events-api.html
   */
  public async createEvent(endpoint: string, body: EventsBuilder, isDevelopment?: boolean): Promise<any> {
    const tokenResponse = await this.getAuthenticationToken("alexa::proactive_events");
    let uri = `${endpoint}/v1/proactiveEvents`;

    if (isDevelopment) {
      uri = `${uri}/stages/development`;
    }

    const options = {
      body: body.build(),
      headers: {
        "Authorization": `Bearer ${tokenResponse.access_token}`,
        "Content-Type": "application/json",
      },
      json: true, // Automatically parses the JSON string in the response
      method: "POST",
      uri,
    };

    return Promise.resolve(rp(options));
  }
}

/**
 * Events Builder class reference
 */
export class EventsBuilder {
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

  public addContent(locale: string, localizedKey: string, localizedValue: string): EventsBuilder {
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
  public setExpiryTime(expiryTime: string): EventsBuilder {
    this.expiryTime = expiryTime;

    return this;
  }

  public setPayload(payload: any): EventsBuilder {
    this.payload = payload;

    return this;
  }

  public setReferenceId(referenceId: string): EventsBuilder {
    this.referenceId = referenceId;

    return this;
  }

  public setMulticast(): EventsBuilder {
    this.relevantAudience = {
      payload: {},
      type: "Multicast",
    };

    return this;
  }

  /*
   * timestamp must be in GMT
   */
  public setTimestamp(timestamp: string): EventsBuilder {
    this.timestamp = timestamp;

    return this;
  }

  public setUnicast(userId: string): EventsBuilder {
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
