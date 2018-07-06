"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const _ = require("lodash");
const AlexaEvent_1 = require("../../src/platforms/alexa/AlexaEvent");
const tools_1 = require("../tools");
describe("AlexaEvent", () => {
    const rb = new tools_1.AlexaRequestBuilder();
    it("should show an empty intent if not an intent request", () => {
        const alexaEvent = new AlexaEvent_1.AlexaEvent(rb.getSessionEndedRequest());
        chai_1.expect(alexaEvent.intent.params).to.be.empty;
        chai_1.expect(alexaEvent.intent.name).equal("");
    });
    it("should format intent slots", () => {
        const rawEvent = rb.getIntentRequest("SomeIntent", { Dish: "Fried Chicken" });
        const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent);
        chai_1.expect(alexaEvent.intent.params).to.deep.equal({ Dish: "Fried Chicken" });
    });
    it("should get token", () => {
        const rawEvent = rb.getPlaybackStoppedRequest("some-token");
        const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent);
        chai_1.expect(alexaEvent.token).to.equal("some-token");
    });
    it("should find users on the context", () => {
        const rawEvent = rb.getIntentRequest("SomeIntent");
        delete rawEvent.session;
        const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent);
        chai_1.expect(alexaEvent.user.userId).to.equal(_.get(rawEvent, "context.System.user.userId"));
    });
    it("should find users on the session", () => {
        // The Echo simulator from the test menu doesn't provide the context, so this is necessary
        const rawEvent = rb.getIntentRequest("SomeIntent");
        delete rawEvent.context;
        const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent);
        chai_1.expect(alexaEvent.user.userId).to.equal(_.get(rawEvent, "session.user.userId"));
    });
    it("should set session attributes to an object on receiving a null value", () => {
        const rawEvent = rb.getLaunchRequest();
        const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent);
        chai_1.expect(alexaEvent.session.attributes).to.deep.equal({});
    });
    it("should return supported capabilities", () => {
        const rawEvent = rb.getLaunchRequest();
        const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent);
        chai_1.expect(alexaEvent.supportedInterfaces).to.deep.equal([
            "AudioPlayer",
            "Display",
        ]);
    });
});
//# sourceMappingURL=AlexaEvent.spec.js.map