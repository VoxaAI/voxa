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

describe("DeviceAddress", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  beforeEach(() => {
    const rb = new AlexaRequestBuilder();
    app =  new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);
    event = rb.getIntentRequest("AddressIntent");
    _.set(event, "context.System.apiAccessToken", "apiAccessToken");
    _.set(event, "context.System.device.deviceId", "deviceId");

    const addressMock = {
      addressLine1: "410 Terry Ave North",
      addressLine2: "",
      addressLine3: "aeiou",
      city: "Seattle",
      countryCode: "US",
      districtOrCounty: "",
      postalCode: "98109",
      stateOrRegion: "WA",
    };

    const postalCodeMock = {
      countryCode: "US",
      postalCode: "98109",
    };

    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v1/devices/deviceId/settings/address")
      .reply(200, JSON.stringify(addressMock))
      .get("/v1/devices/deviceId/settings/address/countryAndPostalCode")
      .reply(200, JSON.stringify(postalCodeMock));
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should get full address", async () => {
    alexaSkill.onIntent("AddressIntent", async (voxaEvent) => {
      let info;

      if (isAlexaEvent(voxaEvent)) {
        info = await voxaEvent.alexa.deviceAddress.getAddress();
        voxaEvent.model.deviceInfo = `${info.addressLine1}, ${info.city}, ${info.countryCode}`;
      }

      return { tell: "DeviceAddress.FullAddress" };
    });

    const reply = await alexaSkill.execute(event, {});

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include("Right now your device is in: 410 Terry Ave North, Seattle, US");
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should get coutry/region and postal code", async () => {
    alexaSkill.onIntent("AddressIntent", async (voxaEvent) => {
      let info;

      if (isAlexaEvent(voxaEvent)) {
        info = await voxaEvent.alexa.deviceAddress.getCountryRegionPostalCode();
        voxaEvent.model.deviceInfo = `${info.postalCode}, ${info.countryCode}`;
      }

      return { tell: "DeviceAddress.PostalCode" };
    });

    const reply = await alexaSkill.execute(event, {});

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include("Your postal code is: 98109, US");
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });

  it("should send error when fetching coutry/region/postal code and permission isn't granted", async () => {
    nock.cleanAll();
    nock("https://api.amazonalexa.com", { reqheaders })
      .get("/v1/devices/deviceId/settings/address/countryAndPostalCode")
      .replyWithError("Access to this resource cannot be requested");

    alexaSkill.onIntent("AddressIntent", async (voxaEvent) => {
      try {
        let info;

        if (isAlexaEvent(voxaEvent)) {
          info = await voxaEvent.alexa.deviceAddress.getCountryRegionPostalCode();
          voxaEvent.model.deviceInfo = `${info.postalCode}, ${info.countryCode}`;
        }

        return { tell: "DeviceAddress.PostalCode" };
      } catch (err) {
        return { tell: "DeviceAddress.PermissionNotGranted" };
      }
    });

    const reply = await alexaSkill.execute(event, {});
    const outputSpeech = "To get the device's address, go to your Alexa app and grant permission to the skill.";

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(outputSpeech);
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });
});
