import { expect } from "chai";
import { DialogFlowEvent } from "../../src/platforms/dialog-flow/DialogFlowEvent";

/* tslint:disable-next-line:no-var-requires */
const rawIntent = require("../requests/dialog-flow/pizzaIntent.json");

/* tslint:disable-next-line:no-var-requires */
const fallbackIntent = require("../requests/dialog-flow/fallbackIntent.json");

/* tslint:disable-next-line:no-var-requires */
const launchIntent = require("../requests/dialog-flow/launchintent2.json");

describe("DialogFlowEvent", () => {
  it("should format intent slots", () => {
    const event = new DialogFlowEvent(rawIntent, {});
    expect(event.intent.params).to.deep.equal({ number: "2", size: "large", waterContent: "" });
  });

  it("should find users on the session", () => {
    const event = new DialogFlowEvent(fallbackIntent, {});
    expect(event.user.userId).to.equal("AI_yXq_n6kfU8IUzovfYOmX-j5Z3");
  });

  it("should find users on the session", () => {
    const event = new DialogFlowEvent(launchIntent, {});
    /* tslint:disable-next-line:max-line-length */
    expect(event.user.userId).to.equal("ABwppHGkgTw-tQmXB_osMOYjJJdBLYO2enYMHwzff0TK0ETbPN6w7jqu3CKMjPCqRJUPnBUHJ4HYA2pTIYNiS3KIuE_A");
  });

  it("should format session parameters", () => {
    const event = new DialogFlowEvent(fallbackIntent, {});
    expect(event.session.attributes).to.deep.equal({
        command: {
          buy: 0,
          feed: 0,
          plant: 0,
        },
    });
  });
});
