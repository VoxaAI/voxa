import { expect } from "chai";
import * as _ from "lodash";
import { AlexaEvent } from "../../src/platforms/alexa/AlexaEvent";
import { AlexaRequestBuilder } from "../tools";

describe("AlexaEvent", () => {
  const rb = new AlexaRequestBuilder();

  it("should show an empty intent if not an intent request", () => {
    const alexaEvent = new AlexaEvent(rb.getSessionEndedRequest());
    expect(alexaEvent.intent.params).to.be.empty;
    expect(alexaEvent.intent.name).equal("");
  });

  it("should format intent slots", () => {
    const rawEvent = rb.getIntentRequest("SomeIntent", { Dish: "Fried Chicken" });
    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.intent.params).to.deep.equal({ Dish: "Fried Chicken" });
  });

  it("should get token", () => {
    const rawEvent = rb.getPlaybackStoppedRequest("some-token");
    const alexaEvent = new AlexaEvent(rawEvent );
    expect(alexaEvent.token).to.equal("some-token");
  });

  it("should find users on the context", () => {
    const rawEvent = rb.getIntentRequest("SomeIntent");
    delete rawEvent.session;

    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.user.userId).to.equal(_.get(rawEvent, "context.System.user.userId"));
  });

  it("should find users on the session", () => {
    // The Echo simulator from the test menu doesn't provide the context, so this is necessary
    const rawEvent = rb.getIntentRequest("SomeIntent");
    delete rawEvent.context;

    const alexaEvent = new AlexaEvent(rawEvent);
    expect(alexaEvent.user.userId).to.equal(_.get(rawEvent, "session.user.userId"));
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
      "AudioPlayer",
      "Display",
    ]);
  });
});
