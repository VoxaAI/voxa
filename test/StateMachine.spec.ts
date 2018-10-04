"use strict";
import { expect } from "chai";
import * as simple from "simple-mock";
import { AlexaEvent, AlexaPlatform, AlexaReply, VoxaApp } from "../src";
import { isState, StateMachine } from "../src/StateMachine";
import { AlexaRequestBuilder } from "./tools";
import { views } from "./views";

const rb = new AlexaRequestBuilder();

describe("StateMachine", () => {
  let states: any;
  let voxaEvent: AlexaEvent;
  let reply: AlexaReply;
  let app: VoxaApp;
  let skill: AlexaPlatform;

  beforeEach(() => {
    app = new VoxaApp({ views });
    skill = new AlexaPlatform(app);
    voxaEvent = new AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));
    voxaEvent.platform = skill;

    reply = new AlexaReply();
    states = {
      core: {
        entry: {
          enter: {
            entry: () => ({
              flow: "terminate",
              tell: "ExitIntent.Farewell",
              to: "die",
            }),
          },
          name: "entry",
        },
        initState: {
          name: "initState",
          to: {
            flow: "terminate",
            tell: "ExitIntent.Farewell",
            to: "die",
          },
        },
        secondState: {
          enter: {
            entry: () => ({ to: "initState", flow: "continue" }),
          },
          name: "secondState",
        },
        thirdState: {
          enter: {
            entry: () => Promise.resolve({ to: "die", flow: "terminate" }),
          },
          name: "thirdState",
        },
      },
    };
  });

  it("should fail if there's no entry state", () => {
    expect(() => new StateMachine({ states: {} })).to.throw(
      "State machine must have a `entry` state.",
    );
  });

  describe("runTransition", () => {
    it("should transition to die", async () => {
      const stateMachine = new StateMachine({ states });
      const response = await stateMachine.runTransition(
        "initState",
        voxaEvent,
        reply,
      );
      if (isState(response.to)) {
        expect(response.to.name).to.equal("die");
      }
    });

    it("should transition more than one state", async () => {
      const stateMachine = new StateMachine({ states });
      const response = await stateMachine.runTransition(
        "secondState",
        voxaEvent,
        reply,
      );
      if (isState(response.to)) {
        expect(response.to.name).to.equal("die");
      }
    });

    it("should call onBeforeStateChangedCallbacks", async () => {
      const onBeforeStateChanged = simple.stub();
      const stateMachine = new StateMachine({
        onBeforeStateChanged: [onBeforeStateChanged],
        states,
      });
      await stateMachine.runTransition("secondState", voxaEvent, reply);
      expect(onBeforeStateChanged.called).to.be.true;
      expect(onBeforeStateChanged.callCount).to.equal(2);
    });

    it("should transition on promises change", async () => {
      const stateMachine = new StateMachine({ states });
      const response = await stateMachine.runTransition(
        "thirdState",
        voxaEvent,
        reply,
      );
      if (isState(response.to)) {
        expect(response.to.name).to.equal("die");
      }
    });

    it("should transition depending on intent if state.to ", async () => {
      states.core.entry = { to: { TestIntent: "die" }, name: "entry" };
      const stateMachine = new StateMachine({ states });
      voxaEvent.intent.name = "TestIntent";
      const response = await stateMachine.runTransition(
        "entry",
        voxaEvent,
        reply,
      );
      if (isState(response.to)) {
        expect(response.to.name).to.equal("die");
      }
    });

    it("should transition to die if result is not an object", async () => {
      states.core.thirdState.enter = {
        entry: () => "LaunchIntent.OpenResponse",
      };

      const stateMachine = new StateMachine({ states });
      const response = await stateMachine.runTransition(
        "thirdState",
        voxaEvent,
        reply,
      );
      if (isState(response.to)) {
        expect(response.to.name).to.equal("die");
      }
    });

    it("should throw an error if there's no transition and no intent", (done) => {
      delete voxaEvent.intent;
      const stateMachine = new StateMachine({ states });
      stateMachine.runTransition("thirdState", voxaEvent, reply).then(
        () => done("Should have thrown"),
        (error) => {
          expect(error.message).to.equal(
            "Running the state machine without an intent",
          );
          done();
        },
      );
    });

    describe("UnhandledState", () => {
      it("should throw UnhandledState on a falsey response from the state transition", (done) => {
        states.core.entry.enter = { entry: () => null };
        const stateMachine = new StateMachine({ states });
        const launchIntent = new AlexaEvent(
          rb.getIntentRequest("LaunchIntent"),
        );
        launchIntent.platform = skill;

        stateMachine.runTransition("entry", launchIntent, reply).then(
          () => done("should have thrown"),
          (error) => {
            expect(error.message).to.equal(
              "LaunchIntent went unhandled on entry state",
            );
            done();
          },
        );
      });

      it("should throw an exception on invalid transition from pojo controller", (done) => {
        states.core.entry = { to: { TestIntent: "die" }, name: "entry" };
        const stateMachine = new StateMachine({ states });
        voxaEvent.intent.name = "OtherIntent";
        stateMachine.runTransition("entry", voxaEvent, reply).then(
          () => done("should have thrown"),
          (error) => {
            expect(error.message).to.equal(
              "OtherIntent went unhandled on entry state",
            );
            done();
          },
        );
      });

      it("should execute the onUnhandledState callbacks on invalid transition from pojo controller", async () => {
        states.entry = { to: { TestIntent: "die" }, name: "entry" };
        const onUnhandledState = simple
          .stub()
          .returnWith(Promise.resolve({ to: "die" }));
        const stateMachine = new StateMachine({
          onUnhandledState: [onUnhandledState],
          states,
        });

        voxaEvent.intent.name = "OtherIntent";
        const response = await stateMachine.runTransition(
          "entry",
          voxaEvent,
          reply,
        );
        return expect(response).to.deep.equal({
          flow: "terminate",
          isTerminal: true,
          name: "die",
          tell: "ExitIntent.Farewell",
          to: {
            isTerminal: true,
            name: "die",
          },
        });
      });
    });
    it("should throw UnknownState when transition.to goes to an undefined state from simple transition", (done) => {
      states.core.entry = {
        name: "entry",
        to: { LaunchIntent: "undefinedState" },
      };
      const stateMachine = new StateMachine({ states });
      voxaEvent.intent.name = "LaunchIntent";
      stateMachine.runTransition("entry", voxaEvent, reply).then(
        () => done("Should have thrown"),
        (error) => {
          expect(error.message).to.equal("Unknown state undefinedState");
          done();
        },
      );
    });

    it("should throw UnknownState when transition.to goes to an undefined state", (done) => {
      states.core.someState = {
        enter: { entry: () => ({ to: "undefinedState" }) },
        name: "someState",
      };
      const stateMachine = new StateMachine({ states });

      stateMachine.runTransition("someState", voxaEvent, reply).then(
        () => done("should have thrown"),
        (error) => {
          expect(error.message).to.equal("Unknown state undefinedState");
          done();
        },
      );
    });

    it("should fallback to entry on no response", async () => {
      states.core.someState = {
        enter: {
          entry: simple.stub().returnWith(null),
        },
        name: "someState",
      };

      const stateMachine = new StateMachine({ states });
      voxaEvent.intent.name = "LaunchIntent";

      const transition = await stateMachine.runTransition(
        "someState",
        voxaEvent,
        reply,
      );
      // expect(states.someState.enter.entry.called).to.be.true;
      expect(transition).to.deep.equal({
        flow: "terminate",
        isTerminal: true,
        name: "die",
        tell: "ExitIntent.Farewell",
        to: {
          isTerminal: true,
          name: "die",
        },
      });
    });
  });

  describe("runCurrentState", () => {
    it("should throw an error if run without an intent", (done) => {
      delete voxaEvent.intent;
      const stateMachine = new StateMachine({ states });
      stateMachine.runCurrentState(voxaEvent, reply).then(
        () => "should have thrown",
        (error) => {
          expect(error.message).to.equal(
            "Running the state machine without an intent",
          );
          done();
        },
      );
    });

    it("should run the specific intent enter function", async () => {
      const stateMachine = new StateMachine({ states });
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
