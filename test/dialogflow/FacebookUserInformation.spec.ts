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
import {
  FACEBOOK_ACTIONS,
  FACEBOOK_USER_FIELDS,
  FacebookEvent,
  FacebookPlatform,
  FacebookReply,
  VoxaApp,
} from "../../src";
import { variables } from "./../variables";
import { views } from "./../views";

const recipient = {
  id: "1234567890",
};

describe("FacebookUserInformation", () => {
  let event: any;
  let app: VoxaApp;
  let facebookBot: FacebookPlatform;

  beforeEach(() => {
    event = _.cloneDeep(require("../requests/dialogflow/facebookLaunchIntent.json"));
    const pageAccessToken = "accessToken";
    app = new VoxaApp({ views, variables });
    facebookBot = new FacebookPlatform(app, { pageAccessToken });

    const userInfo = {
      firstName: "John",
      gender: "male",
      id: "1234567890123546",
      lastName: "Doe",
      locale: "en_US",
      name: "John Doe",
      profilePic: "profilePic",
      timezone: -6,
    };

    mockFacebookActions();

    nock("https://graph.facebook.com")
      .get(`/${recipient.id}?fields=${FACEBOOK_USER_FIELDS.ALL}&access_token=accessToken`)
      .reply(
         200,
         JSON.stringify(userInfo),
       )
      .get(`/${recipient.id}?fields=${FACEBOOK_USER_FIELDS.NAME},${FACEBOOK_USER_FIELDS.TIMEZONE}&access_token=accessToken`)
      .reply(
         200,
         JSON.stringify(userInfo),
       );
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should get full contact information and send all Facebook Actions", async () => {
    app.onIntent(
      "LaunchIntent",
      async (voxaEvent: FacebookEvent) => {
        await voxaEvent.sendMarkSeenAction();
        await voxaEvent.sendTypingOnAction();
        await voxaEvent.sendTypingOffAction();

        const info = await voxaEvent.getUserInformation(FACEBOOK_USER_FIELDS.ALL);

        voxaEvent.model.info = info;
        return {
          flow: "terminate",
          text: "Facebook.User.FullInfo",
          to: "die",
        };
      },
    );

    const reply = await facebookBot.execute(event);
    const outputSpeech = "Nice to meet you John Doe!";

    let sessionAttributes = _.find(reply.outputContexts, (x) => _.endsWith(x.name, "attributes"));
    sessionAttributes = JSON.parse(sessionAttributes.parameters.attributes);

    expect(reply.payload.facebook.text).to.equal(outputSpeech);
    expect(sessionAttributes.state).to.equal("die");
  });

  it("should get full contact information and send an array of Facebook Actions", async () => {
    app.onIntent(
      "LaunchIntent",
      async (voxaEvent: FacebookEvent) => {
        await voxaEvent.sendMarkSeenAction();
        await voxaEvent.sendTypingOnAction();
        await voxaEvent.sendTypingOffAction();

        const actionsArray: FACEBOOK_USER_FIELDS[] = [
          FACEBOOK_USER_FIELDS.NAME,
          FACEBOOK_USER_FIELDS.TIMEZONE,
        ];

        const info = await voxaEvent.getUserInformation(actionsArray);

        voxaEvent.model.info = info;
        return {
          flow: "terminate",
          text: "Facebook.User.FullInfo",
          to: "die",
        };
      },
    );

    const reply = await facebookBot.execute(event);
    const outputSpeech = "Nice to meet you John Doe!";

    let sessionAttributes = _.find(reply.outputContexts, (x) => _.endsWith(x.name, "attributes"));
    sessionAttributes = JSON.parse(sessionAttributes.parameters.attributes);

    expect(reply.payload.facebook.text).to.equal(outputSpeech);
    expect(sessionAttributes.state).to.equal("die");
  });

  it("should throw an error when sending Facebook MarkSeen Action", async () => {
    nock.cleanAll();
    nock("https://graph.facebook.com")
      .post("/v3.2/me/messages?access_token=accessToken", {
        recipient,
        sender_action: FACEBOOK_ACTIONS.MARK_SEEN,
      })
      .replyWithError({
        code: 403,
        message: "Access to this resource cannot be requested",
      });

    app.onIntent(
      "LaunchIntent",
      async (voxaEvent: FacebookEvent) => {
        await voxaEvent.sendMarkSeenAction();
        await voxaEvent.sendTypingOnAction();
        await voxaEvent.sendTypingOffAction();

        const info = await voxaEvent.getUserInformation(FACEBOOK_USER_FIELDS.ALL);

        voxaEvent.model.info = info;
        return {
          flow: "terminate",
          text: "Facebook.User.FullInfo",
          to: "die",
        };
      },
    );

    const reply = await facebookBot.execute(event);
    const outputSpeech = "An unrecoverable error occurred.";

    expect(reply.fulfillmentText).to.equal(outputSpeech);
  });

  it("should throw an error when getting user's information", async () => {
    nock.cleanAll();
    mockFacebookActions();

    nock("https://graph.facebook.com")
      .get(`/id?fields=${FACEBOOK_USER_FIELDS.ALL}&access_token=accessToken`)
      .replyWithError({
        code: 403,
        message: "Access to this resource cannot be requested",
      });

    app.onIntent(
      "LaunchIntent",
      async (voxaEvent: FacebookEvent) => {
        await voxaEvent.sendMarkSeenAction();
        await voxaEvent.sendTypingOnAction();
        await voxaEvent.sendTypingOffAction();

        const info = await voxaEvent.getUserInformation(FACEBOOK_USER_FIELDS.ALL);

        voxaEvent.model.info = info;
        return {
          flow: "terminate",
          text: "Facebook.User.FullInfo",
          to: "die",
        };
      },
    );

    const reply = await facebookBot.execute(event);
    const outputSpeech = "An unrecoverable error occurred.";

    expect(reply.fulfillmentText).to.equal(outputSpeech);
  });
});

function mockFacebookActions() {
  nock("https://graph.facebook.com")
    .post("/v3.2/me/messages?access_token=accessToken", {
      recipient,
      sender_action: FACEBOOK_ACTIONS.MARK_SEEN,
    })
    .reply(200)
    .post("/v3.2/me/messages?access_token=accessToken", {
      recipient,
      sender_action: FACEBOOK_ACTIONS.TYPING_ON,
    })
    .reply(200)
    .post("/v3.2/me/messages?access_token=accessToken", {
      recipient,
      sender_action: FACEBOOK_ACTIONS.TYPING_OFF,
    })
    .reply(200);
}
