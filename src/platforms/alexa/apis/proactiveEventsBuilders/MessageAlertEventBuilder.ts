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

import { EventsBuilder } from "../ProactiveEvents";

/**
 * Message Alert Events Builder class reference
 */
export class MessageAlertEventBuilder extends EventsBuilder {
  public messageGroup: any = {};
  public state: any = {};

  public setMessageGroup(
    creatorName: string,
    count: number,
    urgency?: MESSAGE_ALERT_URGENCY): MessageAlertEventBuilder {
    this.messageGroup = {
      count,
      creator: { name: creatorName },
      urgency,
    };

    return this;
  }

  public setState(status: MESSAGE_ALERT_STATUS, freshness?: MESSAGE_ALERT_FRESHNESS): MessageAlertEventBuilder {
    this.state = { status, freshness };
    return this;
  }

  public build(): MessageAlertEventBuilder {
    const payload = {
      messageGroup: this.messageGroup,
      state: this.state,
    };

    this.setName("AMAZON.MessageAlert.Activated");
    this.setPayload(payload);

    return super.build();
  }
}

export enum MESSAGE_ALERT_FRESHNESS {
  NEW = "NEW",
  OVERDUE = "OVERDUE",
}

export enum MESSAGE_ALERT_STATUS {
  FLAGGED = "FLAGGED",
  UNREAD = "UNREAD",
}

export enum MESSAGE_ALERT_URGENCY {
  URGENT = "URGENT",
}
