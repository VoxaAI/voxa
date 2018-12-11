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

import { ApiBase } from "./ApiBase";

/**
 * Reminders API class reference
 * https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html
 */
export class Reminders extends ApiBase {
  /**
   * Gets a reminder
   * https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html#get-a-reminder
   */
  public getReminder(alertToken: string): Promise<string> {
    return this.getResult(`v1/alerts/reminders/${alertToken}`);
  }
  /**
   * Gets all reminders
   * https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html#get-all-reminders
   */
  public getAllReminders(): Promise<any> {
    return this.getResult("v1/alerts/reminders");
  }

  /**
   * Creates a reminder
   * https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html#create-a-reminder
   */
  public createReminder(reminder: ReminderBuilder): Promise<any> {
    return this.getResult("v1/alerts/reminders", "POST", reminder.build());
  }

  /**
   * Updates a reminder
   * https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html#update-a-reminder
   */
  public updateReminder(alertToken: string, reminder: ReminderBuilder): Promise<any> {
    return this.getResult(`v1/alerts/reminders/${alertToken}`, "PUT", reminder.build());
  }

  /**
   * Deletes a reminder
   * https://developer.amazon.com/docs/smapi/alexa-reminders-api-reference.html#delete-a-reminder
   */
  public deleteReminder(alertToken: string): Promise<string> {
    return this.getResult(`v1/alerts/reminders/${alertToken}`, "DELETE");
  }
}

/**
 * Reminder Builder class reference
 */
export class ReminderBuilder {
  private createdTime?: string;
  private requestTime?: string;
  private triggerType: string = "";
  private offsetInSeconds?: number;
  private scheduledTime?: string;
  private timeZoneId: string = "";
  private recurrenceFreq: string = "";
  private recurrenceByDay?: string[];
  private interval?: number;
  private content: any[] = [];
  private pushNotificationStatus: string = "DISABLED";

  public setCreatedTime(createdTime: string): ReminderBuilder {
    this.createdTime = createdTime;

    return this;
  }

  public setRequestTime(requestTime: string): ReminderBuilder {
    this.requestTime = requestTime;

    return this;
  }

  public setTriggerAbsolute(scheduledTime: string): ReminderBuilder {
    this.offsetInSeconds = undefined;
    this.scheduledTime = scheduledTime;
    this.triggerType = "SCHEDULED_ABSOLUTE";

    return this;
  }

  public setTriggerRelative(offsetInSeconds: number): ReminderBuilder {
    this.offsetInSeconds = offsetInSeconds;
    this.scheduledTime = undefined;
    this.triggerType = "SCHEDULED_RELATIVE";

    return this;
  }

  public setTimeZoneId(timeZoneId: string): ReminderBuilder {
    this.timeZoneId = timeZoneId;

    return this;
  }

  public setRecurrenceFreqDaily(): ReminderBuilder {
    this.recurrenceFreq = "DAILY";

    return this;
  }

  public setRecurrenceFreqWeekly(): ReminderBuilder {
    this.recurrenceFreq = "WEEKLY";

    return this;
  }

  public setRecurrenceByDay(recurrenceByDay: string[]): ReminderBuilder {
    this.recurrenceByDay = recurrenceByDay;

    return this;
  }

  public setRecurrenceInterval(interval: number): ReminderBuilder {
    this.interval = interval;

    return this;
  }

  public addContent(locale: string, text: string): ReminderBuilder {
    this.content = this.content || [];
    this.content.push({ locale, text });

    return this;
  }

  public enablePushNotification(): ReminderBuilder {
    this.pushNotificationStatus = "ENABLED";

    return this;
  }

  public disablePushNotification(): ReminderBuilder {
    this.pushNotificationStatus = "DISABLED";

    return this;
  }

  public build(): any {
    return {
      alertInfo: {
        spokenInfo: {
          content: this.content,
        },
      },
      createdTime: this.createdTime,
      pushNotification: {
        status: this.pushNotificationStatus,
      },
      requestTime: this.requestTime,
      trigger: {
        offsetInSeconds: this.offsetInSeconds,
        recurrence: {
          byDay: this.recurrenceByDay,
          freq: this.recurrenceFreq,
          interval: this.interval,
        },
        scheduledTime: this.scheduledTime,
        timeZoneId: this.timeZoneId,
        type: this.triggerType,
      },
    };
  }

 }
