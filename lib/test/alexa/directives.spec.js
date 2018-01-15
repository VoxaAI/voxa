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
var AlexaAdapter_1 = require("../../src/platforms/alexa/AlexaAdapter");
var AlexaReply_1 = require("../../src/platforms/alexa/AlexaReply");
var DisplayTemplateBuilder_1 = require("../../src/platforms/alexa/DisplayTemplateBuilder");
var CortanaEvent_1 = require("../../src/platforms/cortana/CortanaEvent");
var Renderer_1 = require("../../src/renderers/Renderer");
var VoxaApp_1 = require("../../src/VoxaApp");
var variables_1 = require("../variables");
var directives_1 = require("./../../src/platforms/alexa/directives");
var tools_1 = require("./../tools");
var views_1 = require("./../views");
// tslint:disable-next-line
var cortanaLaunch = require("../requests/cortana/microsoft.launch.json");
chai_1.use(chaiAsPromised);
describe("Alexa directives", function () {
    var event;
    var app;
    var alexaSkill;
    var renderer;
    before(function () {
        i18n.init({
            load: "all",
            nonExplicitWhitelist: true,
            resources: views_1.views,
        });
    });
    beforeEach(function () {
        var rb = new tools_1.AlexaRequestBuilder();
        event = rb.getIntentRequest("AMAZON.YesIntent");
        app = new VoxaApp_1.VoxaApp({ views: views_1.views });
        alexaSkill = new AlexaAdapter_1.AlexaAdapter(app);
        renderer = new Renderer_1.Renderer({ views: views_1.views, variables: variables_1.variables });
    });
    describe("RenderTemplate", function () {
        it("should only add the template if request supports it", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app.onIntent("YesIntent", {
                            RenderTemplate: "RenderTemplate",
                            to: "die",
                        });
                        event.context.System.device.supportedInterfaces = {};
                        return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        chai_1.expect(reply.response.directives).to.be.undefined;
                        return [2 /*return*/];
                }
            });
        }); });
        it("should support adding a template directly", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app.onIntent("YesIntent", function () {
                            var template = new DisplayTemplateBuilder_1.DisplayTemplate("BodyTemplate1");
                            return {
                                RenderTemplate: template,
                            };
                        });
                        return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        chai_1.expect(reply.response.directives[0]).to.deep.equal({
                            template: {
                                backButton: "VISIBLE",
                                type: "BodyTemplate1",
                            },
                            type: "Display.RenderTemplate",
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should add to the directives", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app.onIntent("YesIntent", {
                            RenderTemplate: "RenderTemplate",
                            to: "die",
                        });
                        return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        chai_1.expect(reply.response.directives[0]).to.deep.equal({
                            template: {
                                backButton: "VISIBLE",
                                backgroundImage: "Image",
                                textContent: {
                                    primaryText: {
                                        text: "string",
                                        type: "string",
                                    },
                                    secondaryText: {
                                        text: "string",
                                        type: "string",
                                    },
                                    tertiaryText: {
                                        text: "string",
                                        type: "string",
                                    },
                                },
                                title: "string",
                                token: "string",
                                type: "BodyTemplate1",
                            },
                            type: "Display.RenderTemplate",
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("Hint", function () {
        it("should not add to the reply if not an alexa event", function () { return __awaiter(_this, void 0, void 0, function () {
            var cortanaEvent, reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cortanaEvent = new CortanaEvent_1.CortanaEvent(cortanaLaunch, {}, {});
                        reply = new AlexaReply_1.AlexaReply(cortanaEvent, renderer);
                        return [4 /*yield*/, directives_1.Hint("Hint")(reply, event)];
                    case 1:
                        _a.sent();
                        chai_1.expect(reply.response.directives).to.be.empty;
                        return [2 /*return*/];
                }
            });
        }); });
        it("should only render a single Hint directive", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        if (!reply.response.outputSpeech) {
                            throw new Error("response missing");
                        }
                        chai_1.expect(reply.response.outputSpeech.ssml).to.equal("<speak>An unrecoverable error occurred.</speak>");
                        return [2 /*return*/];
                }
            });
        }); });
        it("should render a Hint directive", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app.onIntent("YesIntent", {
                            Hint: "Hint",
                            to: "die",
                        });
                        return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        chai_1.expect(reply.response.directives).to.deep.equal([{
                                hint: {
                                    text: "string",
                                    type: "PlainText",
                                },
                                type: "Hint",
                            }]);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe("HomeCard", function () {
        it("should be usable from the directives", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app.onIntent("YesIntent", {
                            directives: [directives_1.HomeCard("Card")],
                            to: "die",
                        });
                        return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        chai_1.expect(reply.response.card).to.deep.equal({
                            image: {
                                largeImageUrl: "https://example.com/large.jpg",
                                smallImageUrl: "https://example.com/small.jpg",
                            },
                            title: "Title",
                            type: "Standard",
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should render the home card", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app.onIntent("YesIntent", {
                            HomeCard: "Card",
                            to: "die",
                        });
                        return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        chai_1.expect(reply.response.card).to.deep.equal({
                            image: {
                                largeImageUrl: "https://example.com/large.jpg",
                                smallImageUrl: "https://example.com/small.jpg",
                            },
                            title: "Title",
                            type: "Standard",
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        it("should not allow more than one card", function () { return __awaiter(_this, void 0, void 0, function () {
            var reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        app.onIntent("YesIntent", {
                            HomeCard: "Card",
                            directives: [directives_1.HomeCard("Card")],
                            to: "entry",
                        });
                        app.onError(function (request, error) {
                            chai_1.expect(error.message).to.equal("At most one card can be specified in a response");
                        });
                        return [4 /*yield*/, alexaSkill.execute(event, {})];
                    case 1:
                        reply = _a.sent();
                        if (!reply.response.outputSpeech) {
                            throw new Error("response missing");
                        }
                        chai_1.expect(reply.response.outputSpeech.ssml).to.equal("<speak>An unrecoverable error occurred.</speak>");
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=directives.spec.js.map