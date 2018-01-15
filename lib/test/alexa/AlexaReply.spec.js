"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var directives_1 = require("../../src/directives");
var AlexaEvent_1 = require("../../src/platforms/alexa/AlexaEvent");
var AlexaReply_1 = require("../../src/platforms/alexa/AlexaReply");
var Renderer_1 = require("../../src/renderers/Renderer");
var tools_1 = require("../tools");
var views_1 = require("../views");
var rb = new tools_1.AlexaRequestBuilder();
describe("AlexaReply", function () {
    var reply;
    var event;
    beforeEach(function () {
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("SomeIntent"));
        reply = new AlexaReply_1.AlexaReply(event, new Renderer_1.Renderer({ views: views_1.views }));
    });
    describe("toJSON", function () {
        it("should generate a correct alexa response and reprompt that doesn't  end a session for an ask response", function () {
            reply.response.statements.push("ask");
            reply.response.reprompt = "reprompt";
            reply.response.terminate = false;
            reply.yield();
            chai_1.expect(reply.toJSON()).to.deep.equal({
                response: {
                    // card: undefined,
                    outputSpeech: {
                        ssml: "<speak>ask</speak>",
                        type: "SSML",
                    },
                    reprompt: {
                        outputSpeech: {
                            ssml: "<speak>reprompt</speak>",
                            type: "SSML",
                        },
                    },
                    shouldEndSession: false,
                },
                // sessionAttributes: {},
                version: "1.0",
            });
        });
        it("should generate a correct alexa response that doesn't  end a session for an ask response", function () {
            reply.response.statements.push("ask");
            reply.response.terminate = false;
            chai_1.expect(reply.toJSON()).to.deep.equal({
                response: {
                    outputSpeech: {
                        ssml: "<speak>ask</speak>",
                        type: "SSML",
                    },
                    shouldEndSession: false,
                },
                version: "1.0",
            });
        });
        it("should generate a correct alexa response that ends a session for a tell response", function () {
            reply.response.statements.push("tell");
            chai_1.expect(reply.toJSON()).to.deep.equal({
                response: {
                    outputSpeech: {
                        ssml: "<speak>tell</speak>",
                        type: "SSML",
                    },
                    shouldEndSession: true,
                },
                version: "1.0",
            });
        });
        it("should generate a correct alexa response that doesn't end a session for an ask response", function () { return __awaiter(_this, void 0, void 0, function () {
            var askF;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.askP("ask")];
                    case 1:
                        askF = _a.sent();
                        askF(reply, event);
                        chai_1.expect(reply.toJSON()).to.deep.equal({
                            response: {
                                outputSpeech: {
                                    ssml: "<speak>ask</speak>",
                                    type: "SSML",
                                },
                                shouldEndSession: false,
                            },
                            version: "1.0",
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should generate a correct alexa response that ends a session for a tell response", function () { return __awaiter(_this, void 0, void 0, function () {
            var tellF;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.tellP("tell")];
                    case 1:
                        tellF = _a.sent();
                        tellF(reply, event);
                        chai_1.expect(reply.toJSON()).to.deep.equal({
                            response: {
                                outputSpeech: {
                                    ssml: "<speak>tell</speak>",
                                    type: "SSML",
                                },
                                shouldEndSession: true,
                            },
                            version: "1.0",
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should generate a correct alexa response persisting session attributes", function () {
            var someIntentEvent = rb.getIntentRequest("SomeIntent");
            someIntentEvent.session.attributes = { model: { name: "name" } };
            reply = new AlexaReply_1.AlexaReply(new AlexaEvent_1.AlexaEvent(someIntentEvent), new Renderer_1.Renderer({ views: views_1.views }));
            reply.response.statements.push("tell");
            chai_1.expect(reply.toJSON()).to.deep.equal({
                response: {
                    outputSpeech: {
                        ssml: "<speak>tell</speak>",
                        type: "SSML",
                    },
                    shouldEndSession: true,
                },
                sessionAttributes: {
                    model: {
                        name: "name",
                    },
                },
                version: "1.0",
            });
        });
        it("should generate a correct alexa response with directives", function () {
            reply.response.statements.push("tell");
            reply.response.directives.push({ type: "Hint", hint: { text: "hint", type: "PlainText" } });
            chai_1.expect(reply.toJSON()).to.deep.equal({
                response: {
                    directives: [
                        {
                            hint: {
                                text: "hint",
                                type: "PlainText",
                            },
                            type: "Hint",
                        },
                    ],
                    outputSpeech: {
                        ssml: "<speak>tell</speak>",
                        type: "SSML",
                    },
                    shouldEndSession: true,
                },
                version: "1.0",
            });
        });
    });
});
//# sourceMappingURL=AlexaReply.spec.js.map