"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var botbuilder_1 = require("botbuilder");
var debug = require("debug");
var _ = require("lodash");
var rp = require("request-promise");
var errors_1 = require("request-promise/errors");
var url = require("url");
var VoxaAdapter_1 = require("../VoxaAdapter");
var CortanaEvent_1 = require("./CortanaEvent");
var CortanaReply_1 = require("./CortanaReply");
var log = debug("voxa");
var CortanaRequests = [
    "conversationUpdate",
    "contactRelationUpdate",
    "message",
];
var toAddress = {
    channelId: "channelId",
    conversation: "conversation",
    from: "user",
    id: "id",
    recipient: "bot",
    serviceUrl: "serviceUrl",
};
var CortanaAdapter = /** @class */ (function (_super) {
    __extends(CortanaAdapter, _super);
    function CortanaAdapter(voxaApp, config) {
        var _this = _super.call(this, voxaApp, config) || this;
        if (!config.storage) {
            throw new Error("Cortana requires a state storage");
        }
        _this.recognizerURI = config.recognizerURI;
        _this.storage = config.storage;
        _this.applicationId = config.applicationId;
        _this.applicationPassword = config.applicationPassword;
        _this.qAuthorization = _this.getAuthorization();
        _this.app.onAfterStateChanged(function (voxaEvent, reply, transition) { return _this.partialReply(voxaEvent, reply, transition); });
        _.forEach(CortanaRequests, function (requestType) { return voxaApp.registerRequestHandler(requestType); });
        return _this;
    }
    /*
     * Sends a partial reply after every state change
     */
    CortanaAdapter.prototype.partialReply = function (event, reply, transition) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!reply.hasMessages && !reply.hasDirectives) {
                            return [2 /*return*/, null];
                        }
                        log("partialReply");
                        log({ hasMessages: reply.hasMessages, hasDirectives: reply.hasDirectives, msg: reply.response });
                        return [4 /*yield*/, this.replyToActivity(event, reply)];
                    case 1:
                        _a.sent();
                        reply.clear();
                        return [2 /*return*/, null];
                }
            });
        });
    };
    CortanaAdapter.prototype.getAuthorization = function () {
        return __awaiter(this, void 0, void 0, function () {
            var requestOptions;
            return __generator(this, function (_a) {
                requestOptions = {
                    form: {
                        client_id: this.applicationId,
                        client_secret: this.applicationPassword,
                        grant_type: "client_credentials",
                        scope: "https://api.botframework.com/.default",
                    },
                    json: true,
                    method: "POST",
                    url: "https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token",
                };
                log("getAuthorization");
                log(requestOptions);
                return [2 /*return*/, rp(requestOptions)];
            });
        });
    };
    CortanaAdapter.prototype.execute = function (msg, context) {
        return __awaiter(this, void 0, void 0, function () {
            var stateData, intent, event, reply, promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.prepIncomingMessage(msg);
                        return [4 /*yield*/, this.getStateData(msg)];
                    case 1:
                        stateData = _a.sent();
                        return [4 /*yield*/, this.recognize(msg)];
                    case 2:
                        intent = _a.sent();
                        event = new CortanaEvent_1.CortanaEvent(msg, context, stateData, intent);
                        return [4 /*yield*/, this.app.execute(event, CortanaReply_1.CortanaReply)];
                    case 3:
                        reply = _a.sent();
                        promises = [this.saveStateData(event, reply)];
                        return [4 /*yield*/, Promise.all(promises)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, {}];
                }
            });
        });
    };
    CortanaAdapter.prototype.recognize = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            function entityToParam(entity) {
                return [entity.type, entity.entity];
            }
            var _a, intents, entities;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                if (msg.text) {
                                    return botbuilder_1.LuisRecognizer.recognize(msg.text, _this.config.recognizerURI, function (err, intents, entities) {
                                        if (err) {
                                            return reject(err);
                                        }
                                        resolve({ intents: intents, entities: entities });
                                    });
                                }
                                resolve({});
                            })];
                    case 1:
                        _a = _b.sent(), intents = _a.intents, entities = _a.entities;
                        if (!intents) {
                            return [2 /*return*/, undefined];
                        }
                        return [2 /*return*/, {
                                name: intents[0].intent,
                                params: _(entities).map(entityToParam).fromPairs().value(),
                                rawIntent: { intents: intents, entities: entities },
                            }];
                }
            });
        });
    };
    CortanaAdapter.prototype.prepIncomingMessage = function (msg) {
        // Patch locale and channelData
        moveFieldsTo(msg, msg, {
            channelData: "sourceEvent",
            locale: "textLocale",
        });
        // Ensure basic fields are there
        msg.text = msg.text || "";
        msg.attachments = msg.attachments || [];
        msg.entities = msg.entities || [];
        // Break out address fields
        var address = {};
        moveFieldsTo(msg, address, toAddress);
        msg.address = address;
        msg.source = address.channelId;
        // Check for facebook quick replies
        if (msg.source === "facebook" && msg.sourceEvent && msg.sourceEvent.message && msg.sourceEvent.message.quick_reply) {
            msg.text = msg.sourceEvent.message.quick_reply.payload;
        }
        return msg;
    };
    CortanaAdapter.prototype.replyToActivity = function (event, reply) {
        console.log(JSON.stringify({ event: event.rawEvent }, null, 2));
        var address = event.rawEvent.address;
        var baseUri = address.serviceUrl;
        var conversationId = encodeURIComponent(event.session.sessionId);
        if (!baseUri) {
            throw new Error("serviceUrl is missing");
        }
        var path = "/v3/conversations/" + conversationId + "/activities";
        if (address.id) {
            path += "/" + encodeURIComponent(address.id);
        }
        var uri = url.resolve(baseUri, path);
        return this.botApiRequest("POST", uri, reply.toJSON());
    };
    CortanaAdapter.prototype.getStateData = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var conversationId, userId, context;
            return __generator(this, function (_a) {
                if (!event.address.conversation) {
                    throw new Error("Missing conversation address");
                }
                conversationId = encodeURIComponent(event.address.conversation.id);
                userId = encodeURIComponent(event.address.user.id);
                context = {
                    conversationId: conversationId,
                    persistConversationData: false,
                    persistUserData: false,
                    userId: userId,
                };
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        _this.storage.getData(context, function (err, result) {
                            if (err) {
                                return reject(err);
                            }
                            return resolve(result);
                        });
                    })];
            });
        });
    };
    CortanaAdapter.prototype.saveStateData = function (event, reply) {
        var _this = this;
        var conversationId = encodeURIComponent(event.session.sessionId);
        var userId = encodeURIComponent(event.rawEvent.address.user.id);
        var persistConversationData = false;
        var persistUserData = false;
        var context = {
            conversationId: conversationId,
            persistConversationData: persistConversationData,
            persistUserData: persistUserData,
            userId: userId,
        };
        var data = {
            conversationData: {},
            // we're only gonna handle private conversation data, this keeps the code small
            // and more importantly it makes it so the programming model is the same between
            // the different platforms
            privateConversationData: _.get(reply, "session.attributes"),
            userData: {},
        };
        return new Promise(function (resolve, reject) {
            _this.storage.saveData(context, data, function (error) {
                if (error) {
                    return reject(error);
                }
                return resolve();
            });
        });
    };
    CortanaAdapter.prototype.botApiRequest = function (method, uri, body) {
        return __awaiter(this, void 0, void 0, function () {
            var authorization, requestOptions, reason_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.qAuthorization];
                    case 1:
                        authorization = _a.sent();
                        requestOptions = {
                            method: method,
                            uri: uri,
                            body: body,
                            json: true,
                            auth: {
                                bearer: authorization.access_token,
                            },
                        };
                        log("botApiRequest");
                        log(JSON.stringify(requestOptions, null, 2));
                        return [2 /*return*/, rp(requestOptions)];
                    case 2:
                        reason_1 = _a.sent();
                        if (reason_1 instanceof errors_1.StatusCodeError) {
                            if (reason_1.statusCode === 401) {
                                this.qAuthorization = this.getAuthorization();
                                return [2 /*return*/, this.botApiRequest(method, uri, body)];
                            }
                        }
                        throw reason_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return CortanaAdapter;
}(VoxaAdapter_1.VoxaAdapter));
exports.CortanaAdapter = CortanaAdapter;
function moveFieldsTo(frm, to, fields) {
    if (frm && to) {
        for (var f in fields) {
            if (frm.hasOwnProperty(f)) {
                if (typeof to[f] === "function") {
                    to[fields[f]](frm[f]);
                }
                else {
                    to[fields[f]] = frm[f];
                }
                delete frm[f];
            }
        }
    }
}
exports.moveFieldsTo = moveFieldsTo;
//# sourceMappingURL=CortanaAdapter.js.map