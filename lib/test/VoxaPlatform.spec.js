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
const azure_functions_ts_essentials_1 = require("azure-functions-ts-essentials");
const chai_1 = require("chai");
const VoxaPlatform_1 = require("../src/platforms/VoxaPlatform");
const VoxaApp_1 = require("../src/VoxaApp");
const tools_1 = require("./tools");
const views_1 = require("./views");
const rb = new tools_1.AlexaRequestBuilder();
class Platform extends VoxaPlatform_1.VoxaPlatform {
    constructor() {
        super(...arguments);
        this.platform = "platform";
    }
    execute(e, c) {
        return Promise.resolve({ event: e, context: c });
    }
}
describe("VoxaPlatform", () => {
    describe("lambda", () => {
        it("should call the execute method with the event and context", () => __awaiter(this, void 0, void 0, function* () {
            const app = new VoxaApp_1.VoxaApp({ views: views_1.views });
            const adapter = new Platform(app);
            const handler = adapter.lambda();
            const event = rb.getSessionEndedRequest();
            const callback = (error, result) => {
                chai_1.expect(error).to.be.null;
                chai_1.expect(result.context).to.deep.equal(context);
                chai_1.expect(result.event).to.deep.equal(event);
            };
            const context = tools_1.getLambdaContext(callback);
            yield handler(event, context, callback);
        }));
    });
    describe("lambdaHTTP", () => {
        it("should return a lambda http proxy response object", (done) => {
            const app = new VoxaApp_1.VoxaApp({ views: views_1.views });
            const adapter = new Platform(app);
            const handler = adapter.lambdaHTTP();
            const event = tools_1.getAPIGatewayProxyEvent("POST", JSON.stringify(rb.getSessionEndedRequest()));
            const callback = (error, result) => {
                chai_1.expect(error).to.be.null;
                chai_1.expect(result.statusCode).to.equal(200);
                chai_1.expect(result.headers["Content-Type"]).to.equal("application/json");
                done();
            };
            const context = tools_1.getLambdaContext(callback);
            handler(event, context, callback);
        });
    });
    describe("azureFunction", () => {
        it("should call the execute method with the event body", (done) => {
            const app = new VoxaApp_1.VoxaApp({ views: views_1.views });
            const adapter = new Platform(app);
            const handler = adapter.azureFunction();
            const event = {
                body: rb.getSessionEndedRequest(),
                method: azure_functions_ts_essentials_1.HttpMethod.Post,
            };
            const context = {
                done: (error, result) => {
                    done(error);
                }
            };
            handler(context, event);
        });
    });
    describe("onIntent", () => {
        it("should register onIntent with platform", () => {
            const app = new VoxaApp_1.VoxaApp({ views: views_1.views });
            const adapter = new Platform(app);
            const state = {
                flow: "terminate",
                tell: "Bye",
                to: "die",
            };
            adapter.onIntent("LaunchIntent", state);
            chai_1.expect(adapter.app.states).to.deep.equal({
                core: {},
                platform: {
                    LaunchIntent: {
                        name: "LaunchIntent",
                        to: {
                            flow: "terminate",
                            tell: "Bye",
                            to: "die",
                        },
                    },
                    entry: {
                        name: "entry",
                        to: {
                            LaunchIntent: "LaunchIntent",
                        },
                    },
                },
            });
        });
    });
    describe("onIntent", () => {
        it("should register states as platform specific", () => {
            const app = new VoxaApp_1.VoxaApp({ views: views_1.views });
            const adapter = new Platform(app);
            const state = {
                flow: "terminate",
                tell: "Bye",
                to: "die",
            };
            adapter.onState("someState", state);
            chai_1.expect(adapter.app.states).to.deep.equal({
                core: {},
                platform: {
                    someState: {
                        name: "someState",
                        to: {
                            flow: "terminate",
                            tell: "Bye",
                            to: "die",
                        },
                    },
                },
            });
        });
    });
});
//# sourceMappingURL=VoxaPlatform.spec.js.map