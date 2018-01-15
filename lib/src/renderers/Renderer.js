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
var bluebird = require("bluebird");
var _ = require("lodash");
var Renderer = /** @class */ (function () {
    function Renderer(config) {
        if (!config.variables) {
            config.variables = {};
        }
        if (!config.views) {
            throw new Error("DefaultRenderer config should include views");
        }
        this.config = config;
    }
    Renderer.prototype.renderPath = function (view, voxaEvent, variables) {
        return __awaiter(this, void 0, void 0, function () {
            var locale, platform, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        locale = _.get(voxaEvent, "request.locale");
                        platform = _.get(voxaEvent, "platform");
                        message = voxaEvent.t(view, {
                            returnObjects: true,
                        });
                        if (platform && message[platform]) {
                            message = message[platform];
                        }
                        if (_.isString(message) && message === view) {
                            throw new Error("View " + view + " for " + locale + " locale is missing");
                        }
                        return [4 /*yield*/, this.renderMessage(message, voxaEvent)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Renderer.prototype.renderMessage = function (msg, event) {
        /**
         * it makes a deep search for strings that could have a variable on it
         * @param  any statement - can be a string, array, object or any other value
         * @param VoxaEvent voxaEvent
         * @return Promise             Promise with the statement rendered
         * @example
         * // return { Launch: 'Hi, morning', card: { type: 'Standard', title: 'title' ...}}
         * deepSearchRenderVariable({ Launch: 'hi, {time}', card: '{exitCard}' }, voxaEvent);
         */
        var self = this;
        function deepSearchRenderVariable(statement, voxaEvent) {
            return __awaiter(this, void 0, void 0, function () {
                var objPromises, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!(_.isObject(statement) && !_.isArray(statement))) return [3 /*break*/, 2];
                            objPromises = _.chain(statement)
                                .toPairs()
                                .map(_.spread(function (key, value) {
                                var isAnOpenResponse = _.includes(["ask", "tell", "say", "reprompt"], key);
                                if (isAnOpenResponse && _.isArray(value)) {
                                    return [key, deepSearchRenderVariable(_.sample(value), voxaEvent)];
                                }
                                return [key, deepSearchRenderVariable(value, voxaEvent)];
                            }))
                                .flattenDeep()
                                .value();
                            return [4 /*yield*/, Promise.all(objPromises)];
                        case 1:
                            result = _a.sent();
                            return [2 /*return*/, _.chain(result)
                                    .chunk(2)
                                    .fromPairs()
                                    .value()];
                        case 2:
                            if (!_.isString(statement)) return [3 /*break*/, 4];
                            return [4 /*yield*/, self.renderStatement(statement, voxaEvent)];
                        case 3: return [2 /*return*/, _a.sent()];
                        case 4:
                            if (!_.isArray(statement)) return [3 /*break*/, 6];
                            return [4 /*yield*/, bluebird.map(statement, function (statementItem) { return deepSearchRenderVariable(statementItem, voxaEvent); })];
                        case 5: return [2 /*return*/, _a.sent()];
                        case 6: return [2 /*return*/, statement];
                    }
                });
            });
        }
        return deepSearchRenderVariable(msg, event);
    };
    Renderer.prototype.renderStatement = function (statement, voxaEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenRegx, tokenKeys, qVariables, vars, data, dataKeys, dataValues, singleValue, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tokenRegx = /{([\s\S]+?)}/g;
                        _.templateSettings.interpolate = tokenRegx;
                        tokenKeys = _
                            .uniq(statement.match(tokenRegx) || [])
                            .map(function (str) { return str.substring(1, str.length - 1); });
                        qVariables = _(this.config.variables)
                            .toPairs()
                            .filter(function (item) { return _.includes(tokenKeys, item[0]); })
                            .map(function (item) { return [item[0], item[1](voxaEvent)]; })
                            .flatten()
                            .value();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.all(qVariables)];
                    case 2:
                        vars = _a.sent();
                        data = _(vars).chunk(2).fromPairs().value();
                        dataKeys = _.keys(data);
                        dataValues = _.values(data);
                        if (_.isEmpty(statement.replace(tokenRegx, "").trim()) && dataKeys.length === 1) {
                            singleValue = (_.head(dataValues));
                            return [2 /*return*/, _.isObject(singleValue) ? singleValue : _.template(statement)(data)];
                        }
                        return [2 /*return*/, _.template(statement)(data)];
                    case 3:
                        err_1 = _a.sent();
                        throw new Error("No such variable in views, " + err_1);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Renderer;
}());
exports.Renderer = Renderer;
//# sourceMappingURL=Renderer.js.map