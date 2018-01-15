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
var chaiAsPromised = require("chai-as-promised");
var i18n = require("i18next");
require("mocha");
var directives_1 = require("../src/directives");
var AlexaEvent_1 = require("../src/platforms/alexa/AlexaEvent");
var AlexaReply_1 = require("../src/platforms/alexa/AlexaReply");
var Renderer_1 = require("../src/renderers/Renderer");
var tools_1 = require("./tools");
var views_1 = require("./views");
chai_1.use(chaiAsPromised);
describe("directives", function () {
    var response;
    var event;
    before(function () {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    beforeEach(function () {
        var rb = new tools_1.AlexaRequestBuilder();
        var renderer = new Renderer_1.Renderer({ views: views_1.views });
        event = new AlexaEvent_1.AlexaEvent(rb.getIntentRequest("AMAZON.YesIntent"));
        event.t = i18n.getFixedT(event.request.locale);
        response = new AlexaReply_1.AlexaReply(event, renderer);
    });
    describe("reply", function () {
        it("should render arrays", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.reply(["Say.Say", "Question.Ask"])(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.response.statements).to.deep.equal(["say", "What time is it?"]);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should fail to add after a yield arrays", function () {
            return chai_1.expect(directives_1.reply(["Question.Ask", "Question.Ask"])(response, event))
                .to.eventually.be.rejectedWith(Error, "Can't append to already yielding response");
        });
    });
    describe("tell", function () {
        it("should end the session", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.tell("Question.Ask.ask")(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.response.statements).to.deep.equal(["What time is it?"]);
                        chai_1.expect(response.response.terminate).to.be.true;
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("ask", function () {
        it("should render ask statements", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.ask("Question.Ask.ask")(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.response.statements).to.deep.equal(["What time is it?"]);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should not terminate the session", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.ask("Question.Ask.ask")(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.response.terminate).to.be.false;
                        return [2 /*return*/];
                }
            });
        }); });
        it("should yield", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.ask("Question.Ask.ask")(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.isYielding()).to.be.true;
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("say", function () {
        it("should render ask statements", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.say("Question.Ask.ask")(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.response.statements).to.deep.equal(["What time is it?"]);
                        return [2 /*return*/];
                }
            });
        }); });
        it("should not terminate the session", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.say("Question.Ask.ask")(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.response.terminate).to.be.false;
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("reprompt", function () {
        it("should render reprompt statements", function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, directives_1.reprompt("Question.Ask.ask")(response, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(response.response.reprompt).to.equal("What time is it?");
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=directives.spec.js.map