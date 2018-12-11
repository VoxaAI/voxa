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

import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";

import { AlexaPlatform, IVoxaIntentEvent, ReminderBuilder, VoxaApp } from "../../src";
import { AlexaRequestBuilder, isAlexaEvent } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const reqheaders = {
  accept: "application/json",
  authorization: "Bearer apiAccessToken",
  host: "api.amazonalexa.com",
};

describe("Reminders", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;
  let rb: AlexaRequestBuilder;
  let response: any;

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);
    rb = new AlexaRequestBuilder();

    response = {
      alertToken: "alertToken",
      createdTime: "createdTime",
      href: "href",
      status: "ON",
      updatedTime: "updatedTime",
      version: "version",
    };
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should create a reminder", async () => {
    const reminder: ReminderBuilder = new ReminderBuilder()
      .setCreatedTime("2018-12-11T14:05:38.811")
      .setTriggerAbsolute("2018-12-12T12:00:00.000")
      .setTimeZoneId("America/Denver")
      .setRecurrenceFreqDaily()
      .addContent("en-US", "CREATION REMINDER TEST")
      .enablePushNotification();

    nock("https://api.amazonalexa.com", { reqheaders })
      .post("/v1/alerts/reminders", JSON.stringify(reminder.build()))
      .reply(200, JSON.stringify(response));

    event = rb.getIntentRequest("CreateReminderIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    alexaSkill.onIntent(
      "CreateReminderIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        let reminderResponse;

        if (isAlexaEvent(voxaEvent)) {
          reminderResponse = await voxaEvent.alexa.reminders.createReminder(reminder);
        }

        voxaEvent.model.reminder = reminderResponse;
        return { tell: "Reminder.Created" };
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech = `Reminder created with ID: ${response.alertToken}`;

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should update a reminder", async () => {
    const reminder: ReminderBuilder = new ReminderBuilder()
      .setRequestTime("2018-12-11T14:05:38.811")
      .setTriggerRelative(3000)
      .setTimeZoneId("America/Denver")
      .setRecurrenceFreqWeekly()
      .setRecurrenceInterval(1)
      .addContent("en-US", "UPDATE REMINDER TEST")
      .disablePushNotification();

    nock("https://api.amazonalexa.com", { reqheaders })
      .put(`/v1/alerts/reminders/${response.alertToken}`, JSON.stringify(reminder.build()))
      .reply(200, JSON.stringify(response));

    event = rb.getIntentRequest("UpdateReminderIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    alexaSkill.onIntent(
      "UpdateReminderIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        let reminderResponse;

        if (isAlexaEvent(voxaEvent)) {
          reminderResponse = await voxaEvent.alexa.reminders.updateReminder(response.alertToken, reminder);
        }

        voxaEvent.model.reminder = reminderResponse;
        return { tell: "Reminder.Updated" };
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech = `Reminder updated with ID: ${response.alertToken}`;

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should delete a reminder", async () => {
    nock("https://api.amazonalexa.com", { reqheaders })
      .delete(`/v1/alerts/reminders/${response.alertToken}`)
      .reply(200, JSON.stringify(response));

    event = rb.getIntentRequest("DeleteReminderIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    alexaSkill.onIntent(
      "DeleteReminderIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        let reminderResponse;

        if (isAlexaEvent(voxaEvent)) {
          reminderResponse = await voxaEvent.alexa.reminders.deleteReminder(response.alertToken);
        }

        voxaEvent.model.reminder = reminderResponse;
        return { tell: "Reminder.Deleted" };
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech = "Reminder deleted";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should get a reminder", async () => {
    const getResponse: any = {
      alerts: [
        {
          alertInfo: {
            spokenInfo: {
              content: [
                {
                  locale: "string",
                  text: "REMINDER TEST 1",
                },
              ],
            },
          },
          alertToken: "string",
          createdTime: "2018-08-14T15:47:48.386Z",
          pushNotification: {
            status: "ENABLED",
          },
          status: "ON",
          trigger: {
            offsetInSeconds: 0,
            recurrence: {
              byDay: [ "SU" ],
              freq: "WEEKLY",
              interval: 0,
            },
            scheduledTime: "2018-08-14T15:47:48.387Z",
            timeZoneId: "string",
            type: "SCHEDULED_ABSOLUTE",
          },
          updatedTime: "2018-08-14T15:47:48.386Z",
          version: "string",
        },
      ],
      links: "string",
      totalCount: "string",
    };

    nock("https://api.amazonalexa.com", { reqheaders })
      .get(`/v1/alerts/reminders/${response.alertToken}`)
      .reply(200, JSON.stringify(getResponse));

    event = rb.getIntentRequest("GetReminderIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    alexaSkill.onIntent(
      "GetReminderIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        let reminderResponse: any = {};

        if (isAlexaEvent(voxaEvent)) {
          reminderResponse = await voxaEvent.alexa.reminders.getReminder(response.alertToken);
        }

        voxaEvent.model.reminder = _.head(reminderResponse.alerts);
        return { tell: "Reminder.Get" };
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech = "Reminder content: REMINDER TEST";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should get all reminders", async () => {
    const getResponse: any = {
      alerts: [
        {
          alertInfo: {
            spokenInfo: {
              content: [
                {
                  locale: "string",
                  text: "REMINDER TEST 1",
                },
              ],
            },
          },
          alertToken: "string",
          createdTime: "2018-08-14T15:47:48.386Z",
          pushNotification: {
            status: "ENABLED",
          },
          status: "ON",
          trigger: {
            offsetInSeconds: 0,
            recurrence: {
              byDay: [ "SU" ],
              freq: "WEEKLY",
              interval: 0,
            },
            scheduledTime: "2018-08-14T15:47:48.387Z",
            timeZoneId: "string",
            type: "SCHEDULED_ABSOLUTE",
          },
          updatedTime: "2018-08-14T15:47:48.386Z",
          version: "string",
        },
        {
          alertInfo: {
            spokenInfo: {
              content: [
                {
                  locale: "string",
                  text: "REMINDER TEST 2",
                },
              ],
            },
          },
          alertToken: "string",
          createdTime: "2018-08-14T15:47:48.386Z",
          pushNotification: {
            status: "ENABLED",
          },
          status: "ON",
          trigger: {
            offsetInSeconds: 0,
            recurrence: {
              byDay: [ "SU" ],
              freq: "WEEKLY",
              interval: 0,
            },
            scheduledTime: "2018-08-14T15:47:48.387Z",
            timeZoneId: "string",
            type: "SCHEDULED_ABSOLUTE",
          },
          updatedTime: "2018-08-14T15:47:48.386Z",
          version: "string",
        },
      ],
      links: "string",
      totalCount: "string",
    };

    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v1/alerts/reminders")
      .reply(200, JSON.stringify(getResponse));

    event = rb.getIntentRequest("GetAllRemindersIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    alexaSkill.onIntent(
      "GetAllRemindersIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        let reminderResponse: any = {};

        if (isAlexaEvent(voxaEvent)) {
          reminderResponse = await voxaEvent.alexa.reminders.getAllReminders();
        }

        voxaEvent.model.reminders = reminderResponse.alerts;
        return { tell: "Reminder.GetAllReminders" };
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech = "Reminder content: REMINDER TEST 1, REMINDER TEST 2";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });
});
