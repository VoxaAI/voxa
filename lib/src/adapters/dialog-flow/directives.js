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
var interfaces_1 = require("./interfaces");
function List(templatePath) {
    var _this = this;
    return function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        var listSelect;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_.isString(templatePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, reply.render(templatePath)];
                case 1:
                    listSelect = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    listSelect = templatePath;
                    _a.label = 3;
                case 3:
                    reply.response.directives.push({
                        possibleIntents: {
                            inputValueData: {
                                "@type": interfaces_1.InputValueDataTypes.OPTION,
                                listSelect: listSelect,
                            },
                            intent: interfaces_1.StandardIntents.OPTION,
                        },
                        type: "possibleIntents",
                    });
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.List = List;
function Carousel(templatePath) {
    var _this = this;
    return function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        var carouselSelect;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_.isString(templatePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, reply.render(templatePath)];
                case 1:
                    carouselSelect = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    carouselSelect = templatePath;
                    _a.label = 3;
                case 3:
                    reply.response.directives.push({
                        systemIntent: {
                            intent: interfaces_1.StandardIntents.OPTION,
                            spec: {
                                optionValueSpec: {
                                    carouselSelect: carouselSelect,
                                },
                            },
                        },
                        type: "systemIntent",
                    });
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.Carousel = Carousel;
function Suggestions(suggestions) {
    var _this = this;
    return function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_.isString(suggestions)) return [3 /*break*/, 2];
                    return [4 /*yield*/, reply.render(suggestions)];
                case 1:
                    suggestions = _a.sent();
                    _a.label = 2;
                case 2:
                    reply.response.directives.push({ suggestions: suggestions, type: "suggestions" });
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.Suggestions = Suggestions;
function BasicCard(templatePath) {
    var _this = this;
    return function (reply, event) { return __awaiter(_this, void 0, void 0, function () {
        var basicCard;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_.isString(templatePath)) return [3 /*break*/, 2];
                    return [4 /*yield*/, reply.render(templatePath)];
                case 1:
                    basicCard = _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    basicCard = templatePath;
                    _a.label = 3;
                case 3:
                    reply.response.directives.push({ basicCard: basicCard, type: "basicCard" });
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.BasicCard = BasicCard;
//# sourceMappingURL=directives.js.map