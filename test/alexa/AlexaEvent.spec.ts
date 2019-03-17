import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";
import { IVoxaAlexaUserProfile } from "../../src";
import {
  AlexaEvent,
  AlexaPlatform,
  IVoxaIntentEvent,
  VoxaApp,
  VoxaEvent,
} from "../../src/";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

describe("AlexaEvent", () => {
  const rb = new AlexaRequestBuilder();

  it("should show an empty intent if not an intent request", () => {
    const alexaEvent = new AlexaEvent(rb.getSessionEndedRequest());
    expect(alexaEvent.intent).to.be.undefined;
  });

  it("should format intent slots", () => {
    const rawEvent = rb.getIntentRequest("SomeIntent", {
      Dish: "Fried Chicken",
    });
    const alexaEvent = new AlexaEvent(rawEvent) as IVoxaIntentEvent;
    expect(alexaEvent.intent.params).to.deep.equal({ Dish: "Fried Chicken" });
  });

  it("should get token", () => {
    const rawEvent = rb.getPlaybackStoppedRequest("some-token");
    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.token).to.equal("some-token");
  });

  it("should find users on the context", () => {
    const rawEvent = rb.getIntentRequest("SomeIntent");
    delete rawEvent.session;

    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.user.userId).to.equal(
      _.get(rawEvent, "context.System.user.userId"),
    );
  });

  it("should find users on the session", () => {
    // The Echo simulator from the test menu doesn't provide the context, so this is necessary
    const rawEvent = rb.getIntentRequest("SomeIntent");
    delete rawEvent.context;

    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.user.userId).to.equal(
      _.get(rawEvent, "session.user.userId"),
    );
  });

  it("should set session attributes to an object on receiving a null value", () => {
    const rawEvent = rb.getLaunchRequest();
    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.session.attributes).to.deep.equal({});
  });

  it("should return supported capabilities", () => {
    const rawEvent = rb.getLaunchRequest();
    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.supportedInterfaces).to.deep.equal([
      "Alexa.Presentation.APL",
      "AudioPlayer",
      "Display",
      "VideoApp",
    ]);
  });

  it("should add DisplayElementSelected intent params", () => {
    const rawEvent = rb.getDisplayElementSelectedRequest(
      "SleepSingleIntent@2018-09-13T00:40:16.047Z",
    );
    const alexaEvent = new AlexaEvent(rawEvent) as IVoxaIntentEvent;
    expect(alexaEvent.intent.params).to.be.ok;
  });

  it("should add AlexaPresentationAPLUserEvent intent params", () => {
    const rawEvent = rb.getAlexaPresentationAPLUserEvent();
    const alexaEvent = new AlexaEvent(rawEvent) as IVoxaIntentEvent;
    expect(alexaEvent.intent.params).to.be.ok;
  });
});

describe("LoginWithAmazon", () => {
  const rb = new AlexaRequestBuilder();
  let voxaApp: VoxaApp;
  let alexaSkill: AlexaPlatform;

  beforeEach(() => {
    voxaApp = new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(voxaApp);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should validate user information", async () => {
    const lwaResult: IVoxaAlexaUserProfile = {
      email: "johndoe@example.com",
      name: "John Doe",
      userId: "amzn1.account.K2LI23KL2LK2",
      zipCode: "12345",
    };

    nock("https://api.amazon.com")
      .get("/user/profile?access_token=accessToken")
      .reply(200, {
        email: "johndoe@example.com",
        name: "John Doe",
        postal_code: "12345",
        user_id: "amzn1.account.K2LI23KL2LK2",
      });

    const rawEvent = rb.getLaunchRequest();
    _.set(rawEvent, "session.user.accessToken", "accessToken");

    const alexaEvent = new AlexaEvent(rawEvent) as VoxaEvent;
    alexaEvent.platform = alexaSkill;

    const userDetails = await alexaEvent.getUserInformation();
    expect(userDetails).to.deep.equal(lwaResult);
  });

  it("should throw an error when accessToken is empty", async () => {
    const rawEvent = rb.getLaunchRequest();
    const alexaEvent = new AlexaEvent(rawEvent) as VoxaEvent;
    alexaEvent.platform = alexaSkill;

    let exceptionWasThrown: boolean = false;

    try {
      await alexaEvent.getUserInformation();
    } catch (err) {
      exceptionWasThrown = true;
      expect(err.message).to.equal("this.user.accessToken is empty");
    }

    expect(exceptionWasThrown).to.be.true;
  });
});
