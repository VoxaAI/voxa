"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
const chai_1 = require("chai");
const _ = require("lodash");
const simple = require("simple-mock");
const Model_1 = require("../src/Model");
const AlexaEvent_1 = require("../src/platforms/alexa/AlexaEvent");
const AlexaPlatform_1 = require("../src/platforms/alexa/AlexaPlatform");
const AlexaReply_1 = require("../src/platforms/alexa/AlexaReply");
const VoxaApp_1 = require("../src/VoxaApp");
const tools_1 = require("./tools");
const variables_1 = require("./variables");
const views_1 = require("./views");
const directives_1 = require("../src/platforms/alexa/directives");
const rb = new tools_1.AlexaRequestBuilder();
describe("VoxaApp", () => {
    let statesDefinition;
    let event;
    beforeEach(() => {
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("SomeIntent"));
        simple.mock(AlexaPlatform_1.AlexaPlatform, "apiRequest")
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
        it("should do multiple transitions inside a single entry state", () => __awaiter(this, void 0, void 0, function* () {
            const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
            event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("LaunchIntent"));
            voxaApp.onState("entry", {
                Exit: { tell: "ExitIntent.Farewell" },
                LaunchIntent: "One",
                One: "Two",
                Three: "Exit",
                Two: "Three",
            });
            const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
            // expect(reply.error).to.be.undefined;
            chai_1.expect(reply.speech).to.deep.equal("<speak>Ok. For more info visit example.com site.</speak>");
        }));
    });
    describe("onState", () => {
        it("should accept new states", () => {
            const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
            const fourthState = () => ({ to: "endState" });
            voxaApp.onState("fourthState", fourthState);
            chai_1.expect(voxaApp.states.core.fourthState.enter.entry).to.equal(fourthState);
        });
        it("should register simple states", () => {
            const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
            const stateFn = simple.stub();
            voxaApp.onState("init", stateFn);
            chai_1.expect(voxaApp.states.core.init).to.deep.equal({
                enter: {
                    entry: stateFn,
                },
                name: "init",
            });
        });
        it("should register states for specific intents", () => {
            const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
            const stateFn = simple.stub();
            voxaApp.onState("init", stateFn, "AMAZON.NoIntent");
            chai_1.expect(voxaApp.states.core.init).to.deep.equal({
                enter: { "AMAZON.NoIntent": stateFn },
                name: "init",
            });
        });
        it("should register states for intent lists", () => {
            const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
            const stateFn = simple.stub();
            const stateFn2 = simple.stub();
            voxaApp.onState("init", stateFn, ["AMAZON.NoIntent", "AMAZON.StopIntent"]);
            voxaApp.onState("init", stateFn2, "AMAZON.YesIntent");
            chai_1.expect(voxaApp.states.core.init).to.deep.equal({
                enter: {
                    "AMAZON.NoIntent": stateFn,
                    "AMAZON.StopIntent": stateFn,
                    "AMAZON.YesIntent": stateFn2,
                },
                name: "init",
            });
        });
    });
    it("should include the state in the session response", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        voxaApp.onIntent("LaunchIntent", () => {
            return { to: "secondState", sayp: "This is my message", flow: "yield" };
        });
        voxaApp.onState("secondState", () => ({}));
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("LaunchIntent"));
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        // expect(reply.error).to.be.undefined;
        chai_1.expect(event.model.state).to.equal("secondState");
        chai_1.expect(reply.response.shouldEndSession).to.be.false;
    }));
    it("should add the message key from the transition to the reply", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        voxaApp.onIntent("LaunchIntent", () => ({ sayp: "This is my message" }));
        event.intent.name = "LaunchIntent";
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(reply.speech).to.deep.equal("<speak>This is my message</speak>");
    }));
    it("should throw an error if trying to render a missing view", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        voxaApp.onIntent("LaunchIntent", () => ({ ask: "Missing.View" }));
        event.intent.name = "LaunchIntent";
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        // expect(reply.error).to.be.an("error");
        chai_1.expect(reply.speech).to.equal("<speak>An unrecoverable error occurred.</speak>");
    }));
    it("should allow multiple reply paths in reply key", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        voxaApp.onIntent("LaunchIntent", (voxaEvent) => {
            voxaEvent.model.count = 0;
            return { say: ["Count.Say", "Count.Tell"] };
        });
        event.intent.name = "LaunchIntent";
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(reply.speech).to.deep.equal("<speak>0\n0</speak>");
    }));
    it("should display element selected request", () => __awaiter(this, void 0, void 0, function* () {
        const stateMachineSkill = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        stateMachineSkill.onIntent("Display.ElementSelected", { to: "die", tell: "ExitIntent.Farewell" });
        event.intent = undefined;
        event.request.type = "Display.ElementSelected";
        const reply = yield new AlexaPlatform_1.AlexaPlatform(stateMachineSkill).execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(reply.speech).to.equal("<speak>Ok. For more info visit example.com site.</speak>");
    }));
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
    it("should be able to just pass through some intents to states", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        let called = false;
        voxaApp.onIntent("LoopOffIntent", () => {
            called = true;
            return { tell: "ExitIntent.Farewell", to: "die" };
        });
        const alexa = new AlexaPlatform_1.AlexaPlatform(voxaApp);
        const loopOffEvent = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("AMAZON.LoopOffIntent"));
        yield alexa.execute(loopOffEvent, AlexaReply_1.AlexaReply);
        chai_1.expect(called).to.be.true;
    }));
    it("should accept onBeforeStateChanged callbacks", () => {
        const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        voxaApp.onBeforeStateChanged(simple.stub());
    });
    it("should call the entry state on a new session", () => __awaiter(this, void 0, void 0, function* () {
        statesDefinition.entry = simple.stub().resolveWith({
            reply: "ExitIntent.Farewell",
        });
        const voxaApp = new VoxaApp_1.VoxaApp({ variables: variables_1.variables, views: views_1.views });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(statesDefinition.entry.called).to.be.true;
    }));
    it("should set properties on request and have those available in the state callbacks", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables });
        statesDefinition.entry = simple.spy((request) => {
            chai_1.expect(request.model).to.not.be.undefined;
            chai_1.expect(request.model).to.be.an.instanceOf(Model_1.Model);
            return { tell: "ExitIntent.Farewell", to: "die" };
        });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(statesDefinition.entry.called).to.be.true;
        chai_1.expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
    }));
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
    it("should allow async serialization in Model", () => __awaiter(this, void 0, void 0, function* () {
        class PromisyModel extends Model_1.Model {
            serialize() {
                return Promise.resolve({
                    value: 1,
                });
            }
        }
        const voxaApp = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables, Model: PromisyModel });
        statesDefinition.entry = simple.spy((request) => {
            chai_1.expect(request.model).to.not.be.undefined;
            chai_1.expect(request.model).to.be.an.instanceOf(PromisyModel);
            return { ask: "Question.Ask", to: "initState" };
        });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        const platform = new AlexaPlatform_1.AlexaPlatform(voxaApp);
        const reply = yield platform.execute(event, {});
        chai_1.expect(statesDefinition.entry.called).to.be.true;
        chai_1.expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
        chai_1.expect(reply.sessionAttributes).to.deep.equal({ value: 1 });
    }));
    it("should let  model.fromRequest to return a Promise", () => __awaiter(this, void 0, void 0, function* () {
        class PromisyModel extends Model_1.Model {
            static fromEvent(data) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new PromisyModel();
                });
            }
        }
        const voxaApp = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables, Model: PromisyModel });
        statesDefinition.entry = simple.spy((request) => {
            chai_1.expect(request.model).to.not.be.undefined;
            chai_1.expect(request.model).to.be.an.instanceOf(PromisyModel);
            return { reply: "ExitIntent.Farewell", to: "die" };
        });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(statesDefinition.entry.called).to.be.true;
        chai_1.expect(statesDefinition.entry.lastCall.threw).to.be.not.ok;
    }));
    it("should call onSessionEnded callbacks if state is die", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ Model: Model_1.Model, views: views_1.views, variables: variables_1.variables });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        const onSessionEnded = simple.stub();
        voxaApp.onSessionEnded(onSessionEnded);
        yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(onSessionEnded.called).to.be.true;
    }));
    it("should call onBeforeReplySent callbacks", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ Model: Model_1.Model, views: views_1.views, variables: variables_1.variables });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        const onBeforeReplySent = simple.stub();
        voxaApp.onBeforeReplySent(onBeforeReplySent);
        yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(onBeforeReplySent.called).to.be.true;
    }));
    it("should call entry on a LaunchRequest", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ Model: Model_1.Model, views: views_1.views, variables: variables_1.variables });
        event.intent.name = "LaunchIntent";
        statesDefinition.entry = simple.stub().resolveWith({
            to: "die",
        });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(statesDefinition.entry.called).to.be.true;
    }));
    describe("onUnhandledState", () => {
        it("should call onUnhandledState callbacks when the state" +
            " machine transition throws a UnhandledState error", () => __awaiter(this, void 0, void 0, function* () {
            const voxaApp = new VoxaApp_1.VoxaApp({ Model: Model_1.Model, views: views_1.views, variables: variables_1.variables });
            const onUnhandledState = simple.stub().resolveWith({
                tell: "ExitIntent.Farewell",
            });
            voxaApp.onUnhandledState(onUnhandledState);
            event.intent.name = "LaunchIntent";
            statesDefinition.entry = simple.stub().resolveWith(null);
            _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
            const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
            chai_1.expect(onUnhandledState.called).to.be.true;
            chai_1.expect(reply.speech).to.equal("<speak>Ok. For more info visit example.com site.</speak>");
        }));
    });
    it("should include all directives in the reply", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ Model: Model_1.Model, variables: variables_1.variables, views: views_1.views });
        const directives = [new directives_1.PlayAudio("url", "123", 0, "REPLACE_ALL")];
        voxaApp.onIntent("SomeIntent", () => ({
            directives,
            tell: "ExitIntent.Farewell",
            to: "entry",
        }));
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(reply.response.directives).to.not.be.undefined;
        chai_1.expect(reply.response.directives).to.have.length(1);
        chai_1.expect(reply.response.directives).to.deep.equal([{
                audioItem: {
                    metadata: {},
                    stream: {
                        offsetInMilliseconds: 0,
                        token: "123",
                        url: "url",
                    },
                },
                playBehavior: "REPLACE_ALL",
                type: "AudioPlayer.Play",
            }]);
    }));
    it("should include all directives in the reply even if die", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ Model: Model_1.Model, variables: variables_1.variables, views: views_1.views });
        const directives = [new directives_1.PlayAudio("url", "123", 0, "REPLACE_ALL")];
        voxaApp.onIntent("SomeIntent", () => ({
            directives,
            reply: "ExitIntent.Farewell",
        }));
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(reply.response.directives).to.not.be.undefined;
        chai_1.expect(reply.response.directives).to.have.length(1);
        chai_1.expect(reply.response.directives).to.deep.equal([{
                audioItem: {
                    metadata: {},
                    stream: {
                        offsetInMilliseconds: 0,
                        token: "123",
                        url: "url",
                    },
                },
                playBehavior: "REPLACE_ALL",
                type: "AudioPlayer.Play",
            }]);
    }));
    it("should render all messages after each transition", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ Model: Model_1.Model, views: views_1.views, variables: variables_1.variables });
        event.intent.name = "LaunchIntent";
        statesDefinition.entry = {
            LaunchIntent: "fourthState",
        };
        statesDefinition.fourthState = (request) => {
            request.model.count = 0;
            return { say: "Count.Say", to: "fifthState" };
        };
        statesDefinition.fifthState = (request) => {
            request.model.count = 1;
            return { tell: "Count.Tell", to: "die" };
        };
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(reply.speech).to.deep.equal("<speak>0\n1</speak>");
    }));
    it("should call onIntentRequest callbacks before the statemachine", () => __awaiter(this, void 0, void 0, function* () {
        const voxaApp = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables });
        _.map(statesDefinition, (state, name) => voxaApp.onState(name, state));
        const stubResponse = "STUB RESPONSE";
        const stub = simple.stub().resolveWith(stubResponse);
        voxaApp.onIntentRequest(stub);
        const reply = yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
        chai_1.expect(stub.called).to.be.true;
        chai_1.expect(reply).to.not.equal(stubResponse);
        chai_1.expect(reply.speech).to.equal("<speak>Ok. For more info visit example.com site.</speak>");
    }));
    describe("onRequestStarted", () => {
        it("should return the onError response for exceptions thrown in onRequestStarted", () => __awaiter(this, void 0, void 0, function* () {
            const voxaApp = new VoxaApp_1.VoxaApp({ views: views_1.views, variables: variables_1.variables });
            const spy = simple.spy(() => {
                throw new Error("FAIL!");
            });
            voxaApp.onRequestStarted(spy);
            yield voxaApp.execute(event, new AlexaReply_1.AlexaReply());
            chai_1.expect(spy.called).to.be.true;
        }));
    });
});
//# sourceMappingURL=VoxaApp.spec.js.map