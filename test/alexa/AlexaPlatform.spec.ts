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
import { AlexaPlatform } from "../../src";
import { VoxaApp } from "../../src/VoxaApp";
import { AlexaRequestBuilder } from "../tools";
import { views } from "../views";

describe("AlexaPlatform", () => {
  it("should error if the application has a wrong appId", async () => {
    const rb = new AlexaRequestBuilder("userId", "applicationId");
    const event = rb.getIntentRequest("LaunchIntent");

    const voxaApp = new VoxaApp({ views });
    const alexaSkill = new AlexaPlatform(voxaApp, {
      appIds: "123",
    });

    try {
      await alexaSkill.execute(event);
      throw new Error("This should fail");
    } catch (error) {
      expect(error.message).to.equal("Invalid applicationId");
    }
  });

  it("should error if the application has a wrong appId", async () => {
    const rb = new AlexaRequestBuilder("userId", "applicationId");
    const event = rb.getIntentRequest("LaunchIntent");

    const voxaApp = new VoxaApp({ views });
    const alexaSkill = new AlexaPlatform(voxaApp, {
      appIds: ["123"],
    });

    try {
      await alexaSkill.execute(event);
      throw new Error("This should fail");
    } catch (error) {
      expect(error.message).to.equal("Invalid applicationId");
    }
  });

  it("should work if the application has a correct appId", async () => {
    const rb = new AlexaRequestBuilder("userId", "applicationId");
    const event = rb.getIntentRequest("LaunchIntent");

    const voxaApp = new VoxaApp({ views });
    const alexaSkill = new AlexaPlatform(voxaApp, {
      appIds: ["applicationId"],
    });

    await alexaSkill.execute(event);
  });

  it("should fail with an OnSessionEndedError", async () => {
    const rb = new AlexaRequestBuilder("userId", "applicationId");
    const sessioneEndedRequest = rb.getSessionEndedRequest("ERROR", {
      message:
        "The target device does not support directives for the AudioPlayer interface",
      type: "INVALID_RESPONSE",
    });
    const voxaApp = new VoxaApp({ views });
    const alexaSkill = new AlexaPlatform(voxaApp, {});
    const reply = await alexaSkill.execute(sessioneEndedRequest);
    expect(reply).to.deep.equal({
      response: {
        outputSpeech: {
          ssml: "<speak>An unrecoverable error occurred.</speak>",
          type: "SSML",
        },
        shouldEndSession: true,
      },
      sessionAttributes: {},
      version: "1.0",
    });
  });

  it("should throw an error for invalid SSML", async () => {
    const rb = new AlexaRequestBuilder("userId", "applicationId");
    const launchRequest = rb.getLaunchRequest();
    const voxaApp = new VoxaApp({ views });
    const alexaSkill = new AlexaPlatform(voxaApp, {});
    alexaSkill.onIntent("LaunchIntent", {
      flow: "terminate",
      say: "XML.invalidTag",
    });

    const reply = await alexaSkill.execute(launchRequest);
    expect(reply).to.deep.equal({
      response: {
        outputSpeech: {
          ssml: "<speak>An unrecoverable error occurred.</speak>",
          type: "SSML",
        },
        shouldEndSession: true,
      },
      sessionAttributes: {},
      version: "1.0",
    });
  });
});
