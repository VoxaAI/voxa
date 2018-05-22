import { expect } from "chai";
import { DialogFlowEvent } from "../../src/platforms/dialog-flow/DialogFlowEvent";

/* tslint:disable-next-line:no-var-requires */
const launchIntent = require("../requests/dialog-flow/launchIntent.json");

/* tslint:disable-next-line:no-var-requires */
const optionIntent = require("../requests/dialog-flow/actions.intent.OPTION.json");

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

});
