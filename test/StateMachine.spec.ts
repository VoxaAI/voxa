"use strict";
import { expect, use } from "chai";
import chaiAsPromised = require("chai-as-promised");
import * as simple from "simple-mock";

use(chaiAsPromised);

import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { AlexaReply } from "../src/platforms/alexa/AlexaReply";
import { isState, isTransition, StateMachine } from "../src/StateMachine";
import { AlexaRequestBuilder } from "./tools";

const rb = new AlexaRequestBuilder();

describe("StateMachine", () => {
  let states: any;
  let voxaEvent: AlexaEvent;
  let reply: AlexaReply;

  beforeEach(() => {
    voxaEvent = new AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));
    reply = new AlexaReply();
    states = {
      entry: { enter: { entry: () => ({ reply: "ExitIntent.Farewell", to: "die" }) }, name: "entry" },
      initState: { enter: { entry: () => ({ reply: "ExitIntent.Farewell", to: "die" }) }, name: "initState" },
      secondState: { enter: { entry: () => ({ to: "initState" }) }, name: "secondState" },
      thirdState: { enter: { entry: () => Promise.resolve({ to: "die" }) }, name: "thirdState" },
    };
  });

  it("should fail if there's no entry state", () => {
    expect(() => new StateMachine("initState", { states: {} })).to.throw("State machine must have a `entry` state.");
  });

  describe("runTransition", () => {
    it("should transition to die", async () => {
      const stateMachine = new StateMachine("initState", { states });
      const response = await stateMachine.runTransition(voxaEvent, reply);
      if (isState(response.to)) {
        expect(response.to.name).to.equal(states.die.name);
      }
    });

    it("should transition more than one state", async () => {
      const stateMachine = new StateMachine("secondState", { states });
      const response = await stateMachine.runTransition(voxaEvent, reply);
      if (isState(response.to)) {
        expect(response.to.name).to.equal(states.die.name);
      }
    });

    it("should call onBeforeStateChangedCallbacks", async () => {
      const onBeforeStateChanged = simple.stub();
      const stateMachine = new StateMachine("secondState", { onBeforeStateChanged: [onBeforeStateChanged], states });
      await stateMachine.runTransition(voxaEvent, reply);
      expect(onBeforeStateChanged.called).to.be.true;
      expect(onBeforeStateChanged.callCount).to.equal(2);
    });

    it("should transition on promises change", async () => {
      const stateMachine = new StateMachine("thirdState", { states });
      const response = await stateMachine.runTransition(voxaEvent, reply);
      if (isState(response.to)) {
      expect(response.to.name).to.equal(states.die.name);
      }
    });

    it("should transition depending on intent if state.to ", async () => {
      states.entry = { to: { TestIntent: "die" }, name: "entry" };
      const stateMachine = new StateMachine("entry", { states });
      voxaEvent.intent.name = "TestIntent";
      const response = await stateMachine.runTransition(voxaEvent, reply);
      if (isState(response.to)) {
        expect(response.to.name).to.equal(states.die.name);
      }
    });

    it("should transition to die if result is not an object", async () => {
      states.thirdState.enter = { entry: () => "LaunchIntent.OpenResponse" };

      const stateMachine = new StateMachine("thirdState", { states });
      const response = await stateMachine.runTransition(voxaEvent, reply);
      if (isState(response.to)) {
        expect(response.to.name).to.equal(states.die.name);
      }
    });

    it("should throw an error if there's no transition and no intent", () => {
      delete voxaEvent.intent;
      const stateMachine = new StateMachine("thirdState", { states });
      return expect(stateMachine.runTransition(voxaEvent, reply))
        .to.eventually.be.rejectedWith(Error, "Running the state machine without an intent");
    });

    describe("UnhandledState", () => {
      it("should throw UnhandledState on a falsey response from the state transition", () => {
        states.entry.enter = { entry: () => null };
        const stateMachine = new StateMachine("entry", { states });
        const promise = stateMachine.runTransition(new AlexaEvent(rb.getIntentRequest("LaunchIntent"), {}), reply);
        return expect(promise).to.eventually.be.rejectedWith(Error, "LaunchIntent went unhandled on entry state");
      });

      it("should throw an exception on invalid transition from pojo controller", () => {
        states.entry = { to: { TestIntent: "die" }, name: "entry" };
        const stateMachine = new StateMachine("entry", { states });
        voxaEvent.intent.name = "OtherIntent";
        const promise = stateMachine.runTransition(voxaEvent, reply);
        return expect(promise).to.eventually.be.rejectedWith(Error, "OtherIntent went unhandled on entry state");
      });

      it("should execute the onUnhandledState callbacks on invalid transition from pojo controller", () => {
        states.entry = { to: { TestIntent: "die" }, name: "entry" };
        const onUnhandledState = simple.stub().returnWith(Promise.resolve({ to: "die" }));
        const stateMachine = new StateMachine("entry", {
          onUnhandledState: [onUnhandledState],
          states,
        });

        voxaEvent.intent.name = "OtherIntent";
        const promise = stateMachine.runTransition(voxaEvent, reply);
        return expect(promise).to.eventually.deep.equal({
          to: {
            isTerminal: true,
            name: "die",
          },
        });
      });
    });
    it("should throw UnknownState when transition.to goes to an undefined state from simple transition", () => {
      states.entry = { to: { LaunchIntent: "undefinedState" }, name: "entry" };
      const stateMachine = new StateMachine("entry", { states });
      voxaEvent.intent.name = "LaunchIntent";
      return expect(stateMachine.runTransition(voxaEvent, reply))
        .to.eventually.be.rejectedWith(Error, "Unknown state undefinedState");
    });

    it("should throw UnknownState when transition.to goes to an undefined state", () => {
      states.someState = { enter: { entry: () => ({ to: "undefinedState" }) }, name: "someState" };
      const stateMachine = new StateMachine("someState", { states });

      return expect(stateMachine.runTransition(voxaEvent, reply))
        .to.eventually.be.rejectedWith(Error, "Unknown state undefinedState");
    });

    it("should fallback to entry on no response", async () => {
      states.someState = {
        enter: {
          entry: simple.stub().returnWith(null),
        },
        name: "someState",
      };

      const stateMachine = new StateMachine("someState", { states });
      voxaEvent.intent.name = "LaunchIntent";

      const transition =  await stateMachine.runTransition(voxaEvent, reply);
      // expect(states.someState.enter.entry.called).to.be.true;
      console.log({transition});
      expect(transition).to.deep.equal({
        reply: "ExitIntent.Farewell",
        to: {
          isTerminal: true,
          name: "die",
        },
      });
    });
  });

  describe("runCurrentState", () => {
    it("should throw an error if run without an intent", () => {
      delete voxaEvent.intent;
      const stateMachine = new StateMachine("someState", { states });
      return expect(stateMachine.runCurrentState(voxaEvent, reply))
        .to.eventually.be.rejectedWith(Error, "Running the state machine without an intent");
    });

    it("should run the specific intent enter function", async () => {
      const stateMachine = new StateMachine("someState", { states });
      const stub1 = simple.stub();
      const stub2 = simple.stub();

      stateMachine.currentState = {
        enter: {
          YesIntent: stub1,
          entry: stub2,
          name: "enter",
        },
        isTerminal: false,
        name: "someState",
      };

      await stateMachine.runCurrentState(voxaEvent, reply);
      expect(stub1.called).to.be.true;
      expect(stub2.called).to.be.false;
    });
  });
});
