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

import { AlexaPlatform, IVoxaIntentEvent, VoxaApp } from "../../src";
import { AlexaRequestBuilder, isAlexaEvent } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const reqheaders = {
  accept: "application/json",
  authorization: "Bearer apiAccessToken",
  host: "api.amazonalexa.com",
};

describe("CustomerContact", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    app = new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);
    event = rb.getIntentRequest("InformationIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");

    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/accounts/~current/settings/Profile.email")
      .reply(200, "example@example.com")
      .get("/v2/accounts/~current/settings/Profile.name")
      .reply(200, "John Doe")
      .get("/v2/accounts/~current/settings/Profile.mobileNumber")
      .reply(
        200,
        JSON.stringify({ countryCode: "+1", phoneNumber: "999-999-9999" }),
      );
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should get full contact information", async () => {
    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/accounts/~current/settings/Profile.givenName")
      .reply(200, "John");

    alexaSkill.onIntent(
      "InformationIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        let info;

        if (isAlexaEvent(voxaEvent)) {
          info = await voxaEvent.alexa.customerContact.getFullUserInformation();
        }

        voxaEvent.model.info = info;
        return { tell: "CustomerContact.FullInfo" };
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech =
      "Welcome John, your email address is example@example.com, " +
      "and your phone number is +1 999-999-9999";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should get full contact information but givenName due to safe-to-ignore error", async () => {
    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/accounts/~current/settings/Profile.givenName")
      .replyWithError({
        code: 403,
        message: "Access to this resource cannot be requested",
      });

    alexaSkill.onIntent(
      "InformationIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        let info;

        if (isAlexaEvent(voxaEvent)) {
          info = await voxaEvent.alexa.customerContact.getFullUserInformation();
        }

        voxaEvent.model.info = info;
        return { tell: "CustomerContact.FullInfo" };
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech =
      "Welcome , your email address is example@example.com, " +
      "and your phone number is +1 999-999-9999";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should send error when trying to fetch contact information and permission hasn't been granted", async () => {
    nock.cleanAll();

    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/accounts/~current/settings/Profile.givenName")
      .replyWithError("Access to this resource cannot be requested")
      .get("/v2/accounts/~current/settings/Profile.name")
      .replyWithError({
        code: 500,
        message: "Access to this resource cannot be requested",
      });

    alexaSkill.onIntent(
      "InformationIntent",
      async (voxaEvent: IVoxaIntentEvent) => {
        try {
          let info;

          if (isAlexaEvent(voxaEvent)) {
            info = await voxaEvent.alexa.customerContact.getFullUserInformation();
          }

          voxaEvent.model.info = info;
          return { tell: "CustomerContact.FullInfo" };
        } catch (err) {
          return { tell: "CustomerContact.PermissionNotGranted" };
        }
      },
    );

    const reply = await alexaSkill.execute(event);
    const outputSpeech =
      "To get the user's info, go to your Alexa app and grant permission to the skill.";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });
});
