import { expect } from "chai";
import { AlexaPlatform, DialogFlowPlatform, DialogFlowReply } from "../../src";
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
      await alexaSkill.execute(event, {});
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
      await alexaSkill.execute(event, {});
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

    await alexaSkill.execute(event, {});
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
    const reply = await alexaSkill.execute(sessioneEndedRequest, {});
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
