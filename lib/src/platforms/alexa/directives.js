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
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
function onlyAlexa(target) {
    var _this = this;
    return function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (event.platform !== "alexa") {
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, target(reply, event)];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
}
function HomeCard(templatePath) {
    var _this = this;
    return onlyAlexa(function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        var card;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, reply.render(templatePath)];
                case 1:
                    card = _a.sent();
                    if (reply.hasDirective("card")) {
                        throw new Error("At most one card can be specified in a response");
                    }
                    reply.response.directives.push({ card: card, type: "card" });
                    return [2 /*return*/];
            }
        });
    }); });
}
exports.HomeCard = HomeCard;
function DialogDelegate(slots) {
    var _this = this;
    return onlyAlexa(function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        var directive, directiveSlots;
        return __generator(this, function (_a) {
            if (!event.intent) {
                throw new Error("An intent is required");
            }
            directive = {
                type: "Dialog.Delegate",
            };
            if (slots) {
                directiveSlots = _(slots)
                    .map(function (value, key) {
                    var data = {
                        confirmationStatus: "NONE",
                        name: key,
                    };
                    if (value) {
                        data.value = value;
                    }
                    return [key, data];
                })
                    .fromPairs()
                    .value();
                directive.updatedIntent = {
                    confirmationStatus: "NONE",
                    name: event.intent.name,
                    slots: directiveSlots,
                };
            }
            reply.yield();
            reply.response.terminate = false;
            reply.response.directives.push(directive);
            return [2 /*return*/];
        });
    }); });
}
exports.DialogDelegate = DialogDelegate;
function RenderTemplate(templatePath, token) {
    var _this = this;
    return onlyAlexa(function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        var directive;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!reply.supportsDisplayInterface) {
                        return [2 /*return*/];
                    }
                    if (reply.hasDirective("Display.RenderTemplate")) {
                        throw new Error("At most one Display.RenderTemplate directive can be specified in a response");
                    }
                    if (!_.isString(templatePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, reply.render(templatePath, { token: token })];
                case 1:
                    directive = _a.sent();
                    reply.response.directives.push(directive);
                    return [3 /*break*/, 3];
                case 2:
                    reply.response.directives.push(templatePath);
                    _a.label = 3;
                case 3: return [2 /*return*/];
            }
        });
    }); });
}
exports.RenderTemplate = RenderTemplate;
function AccountLinkingCard() {
    var _this = this;
    return onlyAlexa(function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (reply.hasDirective("card")) {
                throw new Error("At most one card can be specified in a response");
            }
            reply.response.directives.push({ card: { type: "LinkAccount" }, type: "card" });
            return [2 /*return*/];
        });
    }); });
}
exports.AccountLinkingCard = AccountLinkingCard;
function Hint(templatePath) {
    var _this = this;
    return onlyAlexa(function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        var text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (reply.hasDirective("Hint")) {
                        throw new Error("At most one Hint directive can be specified in a response");
                    }
                    return [4 /*yield*/, reply.render(templatePath)];
                case 1:
                    text = _a.sent();
                    reply.response.directives.push({
                        hint: {
                            text: text,
                            type: "PlainText",
                        },
                        type: "Hint",
                    });
                    return [2 /*return*/];
            }
        });
    }); });
}
exports.Hint = Hint;
function PlayAudio(url, token, offsetInMilliseconds, playBehavior) {
    var _this = this;
    if (playBehavior === void 0) { playBehavior = "REPLACE"; }
    return onlyAlexa(function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (reply.hasDirective("VideoApp.Launch")) {
                throw new Error("Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response");
            }
            reply.response.directives.push({
                audioItem: { stream: { token: token, url: url, offsetInMilliseconds: offsetInMilliseconds } },
                playBehavior: playBehavior,
                type: "AudioPlayer.Play",
            });
            return [2 /*return*/];
        });
    }); });
}
exports.PlayAudio = PlayAudio;
//# sourceMappingURL=directives.js.map