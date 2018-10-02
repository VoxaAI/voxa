import "mocha";

import { expect } from "chai";

import * as _ from "lodash";
import {
  AlexaEvent,
  AlexaPlatform,
  AlexaReply,
  IVoxaReply,
  VoxaApp,
} from "../../src";
import * as stateFlow from "../../src/plugins/state-flow";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

const rb = new AlexaRequestBuilder();

describe("StateFlow plugin", () => {
  let states: any;
  let event: any;

  beforeEach(() => {
    event = rb.getIntentRequest("SomeIntent");
    event.session = {
      attributes: {
        state: "secondState",
      },
      new: false,
      outputAttributes: {},
    };

    states = {
      entry: { SomeIntent: "intent" },
      fourthState: () => undefined,
      initState: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
      intent: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
      secondState: () => ({ to: "initState" }),
      thirdState: () => Promise.resolve({ to: "die" }),
    };
  });

  it("should store the execution flow in the request", async () => {
    const app = new VoxaApp({ variables, views });
    const skill = new AlexaPlatform(app);
    _.map(states, (state: any, name: string) => {
      app.onState(name, state);
    });
    stateFlow.register(app);

    const result = await skill.execute(event);
    expect(_.get(result, "sessionAttributes.flow")).to.deep.equal([
      "secondState",
      "initState",
      "die",
    ]);
  });

  it("should not crash on null transition", async () => {
    const app = new VoxaApp({ variables, views });
    const skill = new AlexaPlatform(app);
    _.map(states, (state: any, name: string) => {
      app.onState(name, state);
    });

    stateFlow.register(app);
    event.session.attributes.state = "fourthState";

    const result = await skill.execute(event);
    expect(_.get(result, "sessionAttributes.flow")).to.deep.equal([
      "fourthState",
      "intent",
      "die",
    ]);
  });
});
