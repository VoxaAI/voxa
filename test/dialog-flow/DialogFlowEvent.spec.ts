import { expect } from "chai";
import { DialogFlowEvent } from "../../src/platforms/dialog-flow/DialogFlowEvent";

/* tslint:disable-next-line:no-var-requires */
const rawIntent = require("../requests/dialog-flow/pizzaIntent.json");
/* tslint:disable-next-line:no-var-requires */
const fallbackIntent = require("../requests/dialog-flow/fallbackIntent.json");

describe("DialogFlowEvent", () => {
  it("should format intent slots", () => {
    const event = new DialogFlowEvent(rawIntent, {});
    expect(event.intent.params).to.deep.equal({ number: "2", size: "large", waterContent: "" });
  });

  it("should find users on the session", () => {
    const event = new DialogFlowEvent(fallbackIntent, {});
    expect(event.user.userId).to.equal("AI_yXq_n6kfU8IUzovfYOmX-j5Z3");
  });

  it("should format session parameters", () => {
    const event = new DialogFlowEvent(fallbackIntent, {});
    expect(event.session.attributes).to.deep.equal({
      actions_capability_audio_output: {},
      actions_capability_screen_output: {},
      google_assistant_input_type_keyboard: {},
      model: {
        command: {
          buy: 0,
          feed: 0,
          plant: 0,
        },
      },
      state: "die",
    });
  });
});
