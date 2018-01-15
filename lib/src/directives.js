"use strict";
/*
 * Directives are functions that apply changes on the reply object. They can be registered as keys on the voxa
 * application and then used on transitions
 *
 * For example, the reply directive is used as part of the transition to render ask, say, tell, reprompt or directives.
 *
 * return { reply: 'View' }
 */
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
var bluebird = require("bluebird");
var _ = require("lodash");
function reply(templatePaths) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!_.isArray(templatePaths)) {
                        templatePaths = [templatePaths];
                    }
                    return [4 /*yield*/, bluebird.map(templatePaths, function (tp) { return __awaiter(_this, void 0, void 0, function () {
                            var message;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, response.render(tp)];
                                    case 1:
                                        message = _a.sent();
                                        if (!message.say) return [3 /*break*/, 3];
                                        return [4 /*yield*/, sayP(message.say)(response, event)];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        if (!message.ask) return [3 /*break*/, 5];
                                        return [4 /*yield*/, askP(message.ask)(response, event)];
                                    case 4:
                                        _a.sent();
                                        _a.label = 5;
                                    case 5:
                                        if (!message.tell) return [3 /*break*/, 7];
                                        return [4 /*yield*/, tellP(message.tell)(response, event)];
                                    case 6:
                                        _a.sent();
                                        _a.label = 7;
                                    case 7:
                                        if (!message.reprompt) return [3 /*break*/, 9];
                                        return [4 /*yield*/, repromptP(message.reprompt)(response, event)];
                                    case 8:
                                        _a.sent();
                                        _a.label = 9;
                                    case 9:
                                        if (!message.directives) return [3 /*break*/, 11];
                                        return [4 /*yield*/, directives(message.directives)(response, event)];
                                    case 10:
                                        _a.sent();
                                        _a.label = 11;
                                    case 11: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
}
exports.reply = reply;
/*
 * Takes a template path and renders it, then adds it to the reply as an ask statement
 */
function ask(templatePath) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        var statement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, response.render(templatePath)];
                case 1:
                    statement = _a.sent();
                    return [4 /*yield*/, askP(statement)(response, event)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
}
exports.ask = ask;
/*
 * Plain version of ask, takes an statement and adds it directly to the reply without
 * rendering it first
 */
function askP(statement) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            response.addStatement(statement);
            response.response.terminate = false;
            response.yield();
            return [2 /*return*/];
        });
    }); };
}
exports.askP = askP;
function tell(templatePath) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        var statement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, response.render(templatePath)];
                case 1:
                    statement = _a.sent();
                    return [4 /*yield*/, tellP(statement)(response, event)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
}
exports.tell = tell;
function tellP(statement) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            response.addStatement(statement);
            response.yield();
            return [2 /*return*/];
        });
    }); };
}
exports.tellP = tellP;
function say(templatePath) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        var statement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, response.render(templatePath)];
                case 1:
                    statement = _a.sent();
                    return [4 /*yield*/, sayP(statement)(response, event)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
}
exports.say = say;
function sayP(statement) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            response.addStatement(statement);
            response.response.terminate = false;
            return [2 /*return*/];
        });
    }); };
}
exports.sayP = sayP;
function reprompt(templatePath) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        var statement;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, response.render(templatePath)];
                case 1:
                    statement = _a.sent();
                    return [4 /*yield*/, repromptP(statement)(response, event)];
                case 2: return [2 /*return*/, _a.sent()];
            }
        });
    }); };
}
exports.reprompt = reprompt;
function repromptP(statement) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            response.response.reprompt = statement;
            return [2 /*return*/];
        });
    }); };
}
exports.repromptP = repromptP;
function directives(functions) {
    var _this = this;
    return function (response, event) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(functions && functions.length)) return [3 /*break*/, 2];
                    return [4 /*yield*/, bluebird.map(functions, function (fn) { return fn(response, event); })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    }); };
}
exports.directives = directives;
//# sourceMappingURL=directives.js.map