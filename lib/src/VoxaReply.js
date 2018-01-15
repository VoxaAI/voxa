"use strict";
/**
 * Voxa Reply
 *
 * See message-renderer to see the response structure that
 * Reply expects.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
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
var debug = require("debug");
var _ = require("lodash");
var log = debug("voxa");
var VoxaReply = /** @class */ (function () {
    function VoxaReply(voxaEvent, renderer) {
        this.voxaEvent = voxaEvent;
        this.session = voxaEvent.session;
        this.renderer = renderer;
        this.response = {
            directives: [],
            reprompt: "",
            statements: [],
            terminate: true,
            yield: false,
        };
    }
    VoxaReply.prototype.render = function (templatePath, variables) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.renderer.renderPath(templatePath, this.voxaEvent, variables)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    VoxaReply.prototype.addStatement = function (statement) {
        if (this.isYielding()) {
            throw new Error("Can't append to already yielding response");
        }
        this.response.statements.push(statement);
    };
    Object.defineProperty(VoxaReply.prototype, "hasMessages", {
        get: function () {
            return this.response.statements.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VoxaReply.prototype, "hasDirectives", {
        get: function () {
            return this.response.directives.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    VoxaReply.prototype.clear = function () {
        this.response.reprompt = "";
        this.response.statements = [];
        this.response.directives = [];
    };
    VoxaReply.prototype.yield = function () {
        this.response.yield = true;
        return this;
    };
    VoxaReply.prototype.hasDirective = function (type) {
        return this.response.directives.some(function (directive) {
            if (_.isRegExp(type)) {
                return !!type.exec(directive.type);
            }
            if (_.isString(type)) {
                return type === directive.type;
            }
            if (_.isFunction(type)) {
                return type(directive);
            }
            throw new Error("Do not know how to use a " + typeof type + " to find a directive");
        });
    };
    VoxaReply.prototype.isYielding = function () {
        return this.response.yield;
    };
    return VoxaReply;
}());
exports.VoxaReply = VoxaReply;
//# sourceMappingURL=VoxaReply.js.map