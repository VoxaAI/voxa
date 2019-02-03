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

import { EventBuilder } from "./EventBuilder";

/**
 * Occasion Events Builder class reference
 */
export class OccasionEventBuilder extends EventBuilder {
  public occasion: any = {};
  public state: any = {};

  constructor() {
    super("AMAZON.Occasion.Updated");
  }

  public setOccasion(bookingTime: string, occasionType: OCCASION_TYPE): OccasionEventBuilder {
    this.occasion = {
      bookingTime,
      broker: {
        name: "localizedattribute:brokerName",
      },
      occasionType,
      provider: {
        name: "localizedattribute:providerName",
      },
      subject: "localizedattribute:subject",
    };

    return this;
  }

  public setStatus(confirmationStatus: OCCASION_CONFIRMATION_STATUS): OccasionEventBuilder {
    this.state = { confirmationStatus };

    return this;
  }

  public getPayload(): any {
    return {
      occasion: this.occasion,
      state: this.state,
    };
  }
}

export enum OCCASION_CONFIRMATION_STATUS {
  CANCELED = "CANCELED",
  CONFIRMED = "CONFIRMED",
  CREATED = "CREATED",
  REQUESTED = "REQUESTED",
  RESCHEDULED = "RESCHEDULED",
  UPDATED = "UPDATED",
}

export enum OCCASION_TYPE {
  APPOINTMENT = "APPOINTMENT",
  APPOINTMENT_REQUEST = "APPOINTMENT_REQUEST",
  RESERVATION = "RESERVATION",
  RESERVATION_REQUEST = "RESERVATION_REQUEST",
}
