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

describe("DialogFlowEvent", () => {
  it("should format intent slots", () => {
    const event = new DialogFlowEvent(optionIntent, {});
    expect(event.intent.params).to.deep.equal({
      OPTION: "today",
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

  it("should return the MEDIA_STATUS information", () => {
    const event = new DialogFlowEvent(mediaStatusIntent, {});
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
    });
  });

});
