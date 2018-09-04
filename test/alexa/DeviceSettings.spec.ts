import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";

import { AlexaPlatform } from "../../src/platforms/alexa/AlexaPlatform";
import { VoxaApp } from "../../src/VoxaApp";
import { AlexaRequestBuilder, isAlexaEvent } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const reqheaders = {
  accept: "application/json",
  authorization: "Bearer apiAccessToken",
  host: "api.amazonalexa.com",
};

describe("DeviceSettings", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    app =  new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);
    event = rb.getIntentRequest("SettingsIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");
    _.set(event, "context.System.device.deviceId", "deviceId");

    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/devices/deviceId/settings/System.temperatureUnits")
      .reply(200, "CELSIUS")
      .get("/v2/devices/deviceId/settings/System.timeZone")
      .reply(200, "America/Chicago");
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should get full settings information", async () => {
    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/devices/deviceId/settings/System.distanceUnits")
      .reply(200, "METRIC");

    alexaSkill.onIntent("SettingsIntent", async (voxaEvent) => {
      let info;

      if (isAlexaEvent(voxaEvent)) {
        info = await voxaEvent.alexa.deviceSettings.getSettings();
        voxaEvent.model.settingsInfo = `${info.distanceUnits}, ${info.temperatureUnits}, ${info.timezone}`;
      }

      return { tell: "DeviceSettings.FullSettings" };
    });

    const reply = await alexaSkill.execute(event, {});

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include("Your default settings are: METRIC, CELSIUS, America/Chicago");
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should get full settings information but distanceUnit due to safe-to-ignore error", async () => {
    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/devices/deviceId/settings/System.distanceUnits")
      .replyWithError({ message: "Could not find resource for URI", code: 204 });

    alexaSkill.onIntent("SettingsIntent", async (voxaEvent) => {
      let info;

      if (isAlexaEvent(voxaEvent)) {
        info = await voxaEvent.alexa.deviceSettings.getSettings();
        voxaEvent.model.settingsInfo = `${info.temperatureUnits}, ${info.timezone}`;
      }

      return { tell: "DeviceSettings.FullSettings" };
    });

    const reply = await alexaSkill.execute(event, {});

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include("Your default settings are: CELSIUS, America/Chicago");
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should send error when trying to fetch distance units information", async () => {
    nock.cleanAll();

    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v2/devices/deviceId/settings/System.distanceUnits")
      .replyWithError({ message: "Could not find resource for URI", code: 204 })
      .get("/v2/devices/deviceId/settings/System.temperatureUnits")
      .replyWithError({ message: "Could not find resource for URI", code: 204 })
      .get("/v2/devices/deviceId/settings/System.timeZone")
      .replyWithError("Could not find resource for URI");

    alexaSkill.onIntent("SettingsIntent", async (voxaEvent) => {
      try {
        let info;

        if (isAlexaEvent(voxaEvent)) {
          info = await voxaEvent.alexa.deviceSettings.getSettings();
          voxaEvent.model.settingsInfo = `${info.distanceUnits}, ${info.temperatureUnits}, ${info.timezone}`;
        }

        return { tell: "DeviceSettings.FullSettings" };
      } catch (err) {
        return { tell: "DeviceSettings.Error" };
      }
    });

    const reply = await alexaSkill.execute(event, {});

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include("There was an error trying to get your settings info.");
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });
});
