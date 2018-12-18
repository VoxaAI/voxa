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
import * as querystring from "querystring";

import { AlexaEvent, AlexaPlatform, AlexaReply, IMessageRequest, Messaging, VoxaApp } from "../../src";
import { AlexaRequestBuilder } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const rb = new AlexaRequestBuilder();

describe("Messaging", () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it("should get a new access token and send a message successfully", async () => {
    let reqheaders: any = {
      "accept": "application/json",
      "content-length": 103,
      "content-type": "application/x-www-form-urlencoded",
      "host": "api.amazon.com",
    };

    const bodyRequest = {
      client_id: "clientId",
      client_secret: "clientSecret",
      grant_type: "client_credentials",
      scope: "alexa:skill_messaging",
    };

    const response = {
      access_token: "Atc|MQEWYJxEnP3I1ND03ZzbY_NxQkA7Kn7Aioev_OfMRcyVQ4NxGzJMEaKJ8f0lSOiV-yW270o6fnkI",
      expires_in: 3600,
      scope: "alexa:skill_messaging",
      token_type: "Bearer",
    };

    const body = decodeURIComponent(querystring.stringify(bodyRequest));

    nock("https://api.amazon.com", { reqheaders })
      .post("/auth/O2/token", body)
      .reply(200, JSON.stringify(response));

    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${response.access_token}`,
      "content-length": 51,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";
    const messageBody = {
      data: { name: "John" },
      expiresAfterSeconds: 3600,
    };

    nock(endpoint, { reqheaders })
      .post("/v1/skillmessages/users/userId", messageBody)
      .reply(200);

    const tokenResponse = await Messaging.getAuthToken(bodyRequest.client_id, bodyRequest.client_secret);

    const request: IMessageRequest = {
      data: messageBody.data,
      endpoint,
      skillMessagingToken: tokenResponse.access_token,
      userId,
    };

    const messageResponse = await Messaging.sendMessage(request);

    expect(messageResponse).to.be.undefined;
  });

  it("should respond to MessageReceived request", async () => {
    const app = new VoxaApp({ views, variables });
    const alexaSkill = new AlexaPlatform(app);

    const event = rb.getMessageReceivedRequest({ text: "THIS IS A TEST" });

    app["onMessaging.MessageReceived"](
      async (alexaEvent: AlexaEvent, alexaReply: AlexaReply) => {
        const message = _.get(alexaEvent, "rawEvent.request.message");

        alexaReply.sessionAttributes.message = message.text;

        return alexaReply;
      },
    );

    const reply = await alexaSkill.execute(event);

    expect(_.get(reply, "sessionAttributes.message")).to.equal("THIS IS A TEST");
  });
});
