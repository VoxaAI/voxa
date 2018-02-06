import "mocha";

import { expect, use } from "chai";
import * as  _ from "lodash";
import * as simple from "simple-mock";

import { Model } from "../src/Model";
import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { AlexaPlatform } from "../src/platforms/alexa/AlexaPlatform";
import { AlexaReply } from "../src/platforms/alexa/AlexaReply";
import { VoxaApp } from "../src/VoxaApp";
import { IVoxaEvent } from "../src/VoxaEvent";
import { AlexaRequestBuilder } from "./tools";
import { variables } from "./variables";
import { views } from "./views";

import { PlayAudio } from "../src/platforms/alexa/directives";

const rb = new AlexaRequestBuilder();

describe("VoxaApp", () => {
  let statesDefinition: any;
  let event: any;

  beforeEach(() => {
    event = new AlexaEvent(rb.getIntentRequest("SomeIntent"));
    simple.mock(AlexaPlatform, "apiRequest")
      .resolveWith(true);

    statesDefinition = {
      DisplayElementSelected: { tell: "ExitIntent.Farewell", to: "die" },
      entry: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
      initState: { to: "endState" },
      secondState: { to: "initState" },
      thirdState: () => Promise.resolve({ to: "endState" }),
    };
  });

  describe("entry", () => {
    it("should do multiple transitions inside a single entry state", async () => {
      const voxaApp = new VoxaApp({ variables, views });
      event = new AlexaEvent(rb.getIntentRequest("LaunchIntent"));
      voxaApp.onState("entry", {
        LaunchIntent: "One",
        One: "Two",
        Two: "Three",
        Three: "Exit",
        Exit: { tell: "ExitIntent.Farewell" },
      });

      const reply = await voxaApp.execute(event, new AlexaReply());
      // expect(reply.error).to.be.undefined;
      expect(reply.speech).to.deep.equal("<speak>Ok. For more info visit example.com site.</speak>");
    });
  });

  describe("onState", () => {
    it("should accept new states", () => {
      const voxaApp = new VoxaApp({ variables, views });
      const fourthState = () => ({ to: "endState" });
      voxaApp.onState("fourthState", fourthState);
      expect(voxaApp.states.core.fourthState.enter.entry).to.equal(fourthState);
    });

    it("should register simple states", () => {
      const voxaApp = new VoxaApp({ variables, views });
      const stateFn = simple.stub();
      voxaApp.onState("init", stateFn);

      expect(voxaApp.states.core.init).to.deep.equal({
        enter: {
          entry: stateFn,
        },
        name: "init",
      });
    });

    it("should register states for specific intents", () => {
      const voxaApp = new VoxaApp({ variables, views });
      const stateFn = simple.stub();
      voxaApp.onState("init", stateFn, "AMAZON.NoIntent");

      expect(voxaApp.states.core.init).to.deep.equal({
        enter: { "AMAZON.NoIntent": stateFn },
        name: "init",
      });
    });

    it("should register states for intent lists", () => {
      const voxaApp = new VoxaApp({ variables, views });
      const stateFn = simple.stub();
      const stateFn2 = simple.stub();

      voxaApp.onState("init", stateFn, ["AMAZON.NoIntent", "AMAZON.StopIntent"]);
      voxaApp.onState("init", stateFn2, "AMAZON.YesIntent");

      expect(voxaApp.states.core.init).to.deep.equal({
        enter: {
          "AMAZON.NoIntent": stateFn,
          "AMAZON.StopIntent": stateFn,
          "AMAZON.YesIntent": stateFn2,
        },
        name: "init",
      });
    });
  });

  it("should include the state in the session response", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent("LaunchIntent", () => {
      return { to: "secondState", sayp: "This is my message", flow: "yield" };
    });

    voxaApp.onState("secondState", () => ({}));

    event = new AlexaEvent(rb.getIntentRequest("LaunchIntent"));
    const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    // expect(reply.error).to.be.undefined;
    expect(event.model.state).to.equal("secondState");
    expect(reply.response.shouldEndSession).to.be.false;
  });

  it("should add the message key from the transition to the reply", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent("LaunchIntent", () => ({ sayp: "This is my message"}));
    event.intent.name = "LaunchIntent";

    const reply = await  voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    expect(reply.speech).to.deep.equal("<speak>This is my message</speak>");
  });

  it("should throw an error if trying to render a missing view", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent("LaunchIntent", () => ({ ask: "Missing.View" }));
    event.intent.name = "LaunchIntent";

    const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    // expect(reply.error).to.be.an("error");
    expect(reply.speech).to.equal("<speak>An unrecoverable error occurred.</speak>");
  });

  it("should allow multiple reply paths in reply key", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onIntent("LaunchIntent", (voxaEvent) => {
      voxaEvent.model.count = 0;
      return { say: ["Count.Say", "Count.Tell"] };
    });
    event.intent.name = "LaunchIntent";

    const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    expect(reply.speech).to.deep.equal("<speak>0 0</speak>");
  });

  it("should display element selected request", async () => {
    const stateMachineSkill = new VoxaApp({ variables, views });
    stateMachineSkill.onIntent("Display.ElementSelected", { to: "die", tell: "ExitIntent.Farewell" });
    event.intent = undefined;
    event.request.type = "Display.ElementSelected";

    const reply = await new AlexaPlatform(stateMachineSkill).execute(event, new AlexaReply()) as AlexaReply;
    expect(reply.speech).to.equal("<speak>Ok. For more info visit example.com site.</speak>");
  });

  // it("should throw an error if multiple replies include anything after say or tell", async () => {
    // const voxaApp = new VoxaApp({ variables, views });
    // voxaApp.onIntent("LaunchIntent", (voxaEvent) => {
      // voxaEvent.model.count = 0;
      // return { tell: ["Count.Tell", "Count.Say"] };
    // });
    // event.intent.name = "LaunchIntent";

    // const reply = await  voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    // expect(reply.speech).to.equal("Can't append to already yielding response");
  // });

  it("should be able to just pass through some intents to states", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    let called = false;
    voxaApp.onIntent("LoopOffIntent", () => {
      called = true;
      return { tell: "ExitIntent.Farewell", to: "die" };
    });

    const alexa = new AlexaPlatform(voxaApp);

    const loopOffEvent = new AlexaEvent(rb.getIntentRequest("AMAZON.LoopOffIntent"));

    await alexa.execute(loopOffEvent, AlexaReply);
    expect(called).to.be.true;
  });

  it("should accept onBeforeStateChanged callbacks", () => {
    const voxaApp = new VoxaApp({ variables, views });
    voxaApp.onBeforeStateChanged(simple.stub());
  });

  it("should call the entry state on a new session", async () => {
    statesDefinition.entry = simple.stub().resolveWith({
      reply: "ExitIntent.Farewell",
    });

    const voxaApp = new VoxaApp({ variables, views });
    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));

    await voxaApp.execute(event, new AlexaReply());
    expect(statesDefinition.entry.called).to.be.true;
  });

  // it("should throw an error if required properties missing from config", () => {
    // expect(() => new VoxaApp({ Model: { } })).to.throw(Error, "Model should have a fromEvent method");
    // expect(() => new VoxaApp({ Model: { fromEvent: () => {} } })).to.throw(Error, "Model should have a serialize method");
    // expect(() => new VoxaApp({ Model })).to.throw(Error, "DefaultRenderer config should include views");
    // expect(() => new VoxaApp({ Model, views })).to.not.throw(Error);
  // });

  it("should set properties on request and have those available in the state callbacks", async () => {
    const voxaApp = new VoxaApp({ views, variables });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(Model);

      return { tell: "ExitIntent.Farewell", to: "die" };
    });

    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    await voxaApp.execute(event, new AlexaReply());
    expect(statesDefinition.entry.called).to.be.true;
    expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
  });

  // it("should simply set an empty session if serialize is missing", async () => {
    // const voxaApp = new VoxaApp({ views, variables });
    // statesDefinition.entry = simple.spy((request) => {
      // request.model = null;
      // return { ask: "Question.Ask", to: "initState" };
    // });
    // _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    // const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    // // expect(reply.error).to.be.undefined;
    // expect(statesDefinition.entry.called).to.be.true;
    // expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
    // expect(reply.sessionAttributes).to.deep.equal(new Model({ state: "initState" }));
  // });

  it("should allow async serialization in Model", async () => {
    class PromisyModel extends Model {
      public serialize() { // eslint-disable-line class-methods-use-this
        return Promise.resolve({
          value: 1,
        });
      }
    }

    const voxaApp = new VoxaApp({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { ask: "Question.Ask", to: "initState" };
    });

    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    const platform = new AlexaPlatform(voxaApp);
    const reply = await  platform.execute(event, {}) as AlexaReply;
    expect(statesDefinition.entry.called).to.be.true;
    expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
    expect(reply.sessionAttributes).to.deep.equal({ value: 1 });
  });

  it("should let  model.fromRequest to return a Promise", async () => {
    class PromisyModel extends Model {
      public static async fromEvent(data: any) {
        return new PromisyModel();
      }
    }

    const voxaApp = new VoxaApp({ views, variables, Model: PromisyModel });
    statesDefinition.entry = simple.spy((request) => {
      expect(request.model).to.not.be.undefined;
      expect(request.model).to.be.an.instanceOf(PromisyModel);
      return { reply: "ExitIntent.Farewell", to: "die" };
    });

    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    await voxaApp.execute(event, new AlexaReply()) ;
    expect(statesDefinition.entry.called).to.be.true;
    expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
  });

  it("should call onSessionEnded callbacks if state is die", async () => {
    const voxaApp = new VoxaApp({ Model, views, variables });
    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    const onSessionEnded = simple.stub();
    voxaApp.onSessionEnded(onSessionEnded);

    await voxaApp.execute(event, new AlexaReply());
    expect(onSessionEnded.called).to.be.true;
  });

  it("should call onBeforeReplySent callbacks", async () => {
    const voxaApp = new VoxaApp({ Model, views, variables });
    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    const onBeforeReplySent = simple.stub();
    voxaApp.onBeforeReplySent(onBeforeReplySent);

    await voxaApp.execute(event, new AlexaReply());
    expect(onBeforeReplySent.called).to.be.true;
  });

  it("should call entry on a LaunchRequest", async () => {
    const voxaApp = new VoxaApp({ Model, views, variables });

    event.intent.name = "LaunchIntent";
    statesDefinition.entry = simple.stub().resolveWith({
      to: "die",
    });

    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    await voxaApp.execute(event, new AlexaReply()) ;
    expect(statesDefinition.entry.called).to.be.true;
  });

  describe("onUnhandledState", () => {
    it("should call onUnhandledState callbacks when the state machine transition throws a UnhandledState error", async () => {
      const voxaApp = new VoxaApp({ Model, views, variables });
      const onUnhandledState = simple.stub().resolveWith({
        tell: "ExitIntent.Farewell",
      });

      voxaApp.onUnhandledState(onUnhandledState);

      event.intent.name = "LaunchIntent";
      statesDefinition.entry = simple.stub().resolveWith(null);

      _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
      const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
      expect(onUnhandledState.called).to.be.true;
      expect(reply.speech).to.equal("<speak>Ok. For more info visit example.com site.</speak>");
    });
  });

  it("should include all directives in the reply", async () => {
    const voxaApp = new VoxaApp({ Model, variables, views });

    const directives = [new PlayAudio("url", "123", 0, "REPLACE_ALL")];

    voxaApp.onIntent("SomeIntent", () => ({
      directives,
      tell: "ExitIntent.Farewell",
      to: "entry",
    }));

    const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    expect(reply.response.directives).to.not.be.undefined;
    expect(reply.response.directives).to.have.length(1);
    expect(reply.response.directives[0]).to.deep.equal({
      audioItem: {
        stream: {
          offsetInMilliseconds: 0,
          token: "123",
          url: "url",
        },
      },
      playBehavior: "REPLACE_ALL",
      type: "AudioPlayer.Play",
    });
  });

  it("should include all directives in the reply even if die", async () => {
    const voxaApp = new VoxaApp({ Model, variables, views });

    const directives = [new PlayAudio("url", "123", 0, "REPLACE_ALL")];

    voxaApp.onIntent("SomeIntent", () => ({
      directives,
      reply: "ExitIntent.Farewell",
    }));

    const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    expect(reply.response.directives).to.not.be.undefined;
    expect(reply.response.directives).to.have.length(1);
    expect(reply.response.directives[0]).to.deep.equal({
      audioItem: {
        stream: {
          offsetInMilliseconds: 0,
          token: "123",
          url: "url",
        },
      },
      playBehavior: "REPLACE_ALL",
      type: "AudioPlayer.Play",
    });
  });

  it("should render all messages after each transition", async () => {
    const voxaApp = new VoxaApp({ Model, views, variables });

    event.intent.name = "LaunchIntent";
    statesDefinition.entry = {
      LaunchIntent: "fourthState",
    };

    statesDefinition.fourthState = (request: IVoxaEvent) => {
      request.model.count = 0;
      return { say: "Count.Say", to: "fifthState" };
    };

    statesDefinition.fifthState = (request: IVoxaEvent) => {
      request.model.count = 1;
      return { tell: "Count.Tell", to: "die" };
    };

    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    expect(reply.speech).to.deep.equal("<speak>0 1</speak>");
  });

  it("should call onIntentRequest callbacks before the statemachine", async () => {
    const voxaApp = new VoxaApp({ views, variables });
    _.map(statesDefinition, (state: any, name: string) => voxaApp.onState(name, state));
    const stubResponse = "STUB RESPONSE";
    const stub = simple.stub().resolveWith(stubResponse);
    voxaApp.onIntentRequest(stub);

    const reply = await voxaApp.execute(event, new AlexaReply()) as AlexaReply;
    expect(stub.called).to.be.true;
    expect(reply).to.not.equal(stubResponse);
    expect(reply.speech).to.equal("<speak>Ok. For more info visit example.com site.</speak>");
  });

  describe("onRequestStarted", () => {
    it("should return the onError response for exceptions thrown in onRequestStarted", async () => {
      const voxaApp = new VoxaApp({ views, variables });
      const spy = simple.spy(() => {
        throw new Error("FAIL!");
      });

      voxaApp.onRequestStarted(spy);

      await voxaApp.execute(event, new AlexaReply());
      expect(spy.called).to.be.true;
    });
  });
});
