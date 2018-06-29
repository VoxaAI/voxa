import { DialogflowConversation, DialogflowConversationOptions } from "actions-on-google";
import { expect } from "chai";
import { DialogFlowEvent } from "../../src/platforms/dialog-flow/DialogFlowEvent";

/* tslint:disable-next-line:no-var-requires */
const launchIntent = require("../requests/dialog-flow/launchIntent.json");

/* tslint:disable-next-line:no-var-requires */
const optionIntent = require("../requests/dialog-flow/actions.intent.OPTION.json");

/* tslint:disable-next-line:no-var-requires */
const mediaStatusIntent = require("../requests/dialog-flow/actions.intent.MEDIA_STATUS.json");

/* tslint:disable-next-line:no-var-requires */
const signinIntent = require("../requests/dialog-flow/actions.intent.SIGN_IN.json");

/* tslint:disable-next-line:no-var-requires */
const helpIntent = require("../requests/dialog-flow/helpIntent.json");

/* tslint:disable-next-line:no-var-requires */
const permissionIntent = require("../requests/dialog-flow/actions.intent.PERMISSION.json");

/* tslint:disable-next-line:no-var-requires */
const datetimeIntent = require("../requests/dialog-flow/actions.intent.DATETIME.json");

/* tslint:disable-next-line:no-var-requires */
const placeIntent = require("../requests/dialog-flow/actions.intent.PLACE.json");

/* tslint:disable-next-line:no-var-requires */
const confirmationIntent = require("../requests/dialog-flow/actions.intent.CONFIRMATION.json");

/* tslint:disable-next-line:no-var-requires */
const slotsIntent = require("../requests/dialog-flow/slots.json");

describe("DialogFlowEvent", () => {
  it("should format option values", () => {
    const event = new DialogFlowEvent(optionIntent, {});
    expect(event.intent.name).to.equal("actions.intent.OPTION");
    expect(event.intent.params).to.deep.equal({
      OPTION: "today",
      TOUCH: "Today's meditation",
    });
  });

  it("should format dialogflow parms", () => {
    const event = new DialogFlowEvent(slotsIntent, {});
    expect(event.intent.name).to.equal("SleepSingleIntent");
    expect(event.intent.params).to.deep.equal({
      VOICE: "10 minutes sleep exercise",
      length: {
        amount: 10,
        unit: "min",
      },
        requestPhrase: "",
      text: "10 minutes sleep exercise",
    });
  });

  it("should find users on the session", () => {
    const event = new DialogFlowEvent(launchIntent, {});
    /* tslint:disable-next-line:max-line-length */
    expect(event.user.userId).to.equal("ABwppHG14A5zlHSo4Q6CMw3IHD6a3UtYXEtEtcrDrQwBOWKO95VRm-rL-DdhbzDeHXUXiwpDcrDAzY19C8Y");
  });

  it("should return supported capabilities", () => {
    const event = new DialogFlowEvent(launchIntent, {});
    expect(event.supportedInterfaces).to.deep.equal([
      "actions.capability.AUDIO_OUTPUT",
      "actions.capability.SCREEN_OUTPUT",
      "actions.capability.MEDIA_RESPONSE_AUDIO",
      "actions.capability.WEB_BROWSER",
    ]);
  });

  it("should return inputs", () => {
    const event = new DialogFlowEvent(launchIntent, {});
    expect(event.intent.name).to.equal("LaunchIntent");
    expect(event.intent.params).to.deep.equal({
      KEYBOARD: "Talk to my test app",
       requestPhrase: "",
    });
  });

  it("should return the MEDIA_STATUS information", () => {
    const event = new DialogFlowEvent(mediaStatusIntent, {});
    expect(event.intent.name).to.equal("MEDIA_STATUS");
    expect(event.intent.params).to.deep.equal({
      MEDIA_STATUS: {
        "@type": "type.googleapis.com/google.actions.v2.MediaStatus",
        "status": "FINISHED",
      },
    });
  });

  it("should return the SIGN_IN information", () => {
    const event = new DialogFlowEvent(signinIntent, {});
    expect(event.intent.params).to.deep.equal({
        SIGN_IN: {
          "@type": "type.googleapis.com/google.actions.v2.SignInValue",
          "status": "OK",
      },
    });
  });

  it("should return the correct intent", () => {
    const event = new DialogFlowEvent(helpIntent, {});
    expect(event.intent.name).to.equal("HelpIntent");
  });

  it("should extract the session attributes from the context", () => {
    const event = new DialogFlowEvent(helpIntent, {});
    expect(event.session.attributes).to.deep.equal({
        key: "value",
    });
  });

  it("should extract the correct parameters from a permissionIntent", () => {
    const event = new DialogFlowEvent(permissionIntent, {});
    expect(event.intent.params).to.deep.equal({
      KEYBOARD: "yes",
      PERMISSION: true,
    });

    expect(event.user.permissions).to.deep.equal(["NAME"]);
  });

  it("should extract the correct parameters from a datetimeIntent", () => {
    const event = new DialogFlowEvent(datetimeIntent, {});
    expect(event.intent.params).to.deep.equal({
      DATETIME: {
          date: {
            day: 8,
            month: 6,
            year: 2018,
          },
          time: {
            hours: 12,
          },
      },
      KEYBOARD: "noon",
    });
  });

  it("should extract the correct parameters from a confirmationIntent", () => {
    const event = new DialogFlowEvent(placeIntent, {});
    expect(event.intent.params).to.deep.equal({
        KEYBOARD: "Query handled by Actions on Google",
      PLACE: {
          coordinates: {
            latitude: 37.1390728,
            longitude: -121.6572152,
          },
          formattedAddress: "Digital Drive, Morgan Hill, CA 95037, USA",
          name: "Digital Drive",
          placeId: "ChIJF_RbBuogjoAR0BmGuyTKHCY",
      },
    });
  });
});
