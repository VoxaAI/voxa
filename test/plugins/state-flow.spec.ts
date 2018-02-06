import "mocha";

import { expect, use } from "chai";

import * as _ from "lodash";
import { AlexaEvent } from "../../src/platforms/alexa/AlexaEvent";
import { AlexaPlatform } from "../../src/platforms/alexa/AlexaPlatform";
import { AlexaReply } from "../../src/platforms/alexa/AlexaReply";
import * as stateFlow from "../../src/plugins/state-flow";
import { VoxaApp } from "../../src/VoxaApp";
import { IVoxaReply } from "../../src/VoxaReply";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

const rb = new AlexaRequestBuilder();

describe("StateFlow plugin", () => {
  let states: any;
  let event: any;

  beforeEach(() => {
    event = new AlexaEvent(rb.getIntentRequest("SomeIntent"));
    event.session = {
      attributes: {
        state: "secondState",
      },
      new: false,
    };

    states = {
      entry: { SomeIntent: "intent" },
      initState: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
      secondState: () => ({ to: "initState" }),
      thirdState: () => Promise.resolve({ to: "die" }),
      fourthState: () => undefined,
      intent: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
    };
  });

  it("should store the execution flow in the request", async () => {
    const skill = new VoxaApp({ variables, views });
    _.map(states, (state: any, name: string) => {
      skill.onState(name, state);
    });
    stateFlow.register(skill);

    const result = await skill.execute(event, new AlexaReply());
    expect(event.model.flow).to.deep.equal(["secondState", "initState", "die"]);
  });

  it("should not crash on null transition", async () => {
    const skill = new VoxaApp({ variables, views });
    _.map(states, (state: any, name: string) => {
      skill.onState(name, state);
    });

    stateFlow.register(skill);
    event.session.attributes.state = "fourthState";
    event.intent.name = "OtherIntent";

    const result = await skill.execute(event, new AlexaReply());
    expect(event.model.flow).to.deep.equal(["fourthState"]);
  });
});
