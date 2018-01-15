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
var debug = require("debug");
var _ = require("lodash");
var rp = require("request-promise");
var url = require("url");
var ssml_1 = require("../../ssml");
var VoxaAdapter_1 = require("../VoxaAdapter");
var AlexaEvent_1 = require("./AlexaEvent");
var AlexaReply_1 = require("./AlexaReply");
var directives_1 = require("./directives");
var log = debug("voxa");
var AlexaRequests = [
    "AudioPlayer.PlaybackStarted",
    "AudioPlayer.PlaybackFinished",
    "AudioPlayer.PlaybackNearlyFinished",
    "AudioPlayer.PlaybackStopped",
    "AudioPlayer.PlaybackFailed",
    "System.ExceptionEncountered",
    "PlaybackController.NextCommandIssued",
    "PlaybackController.PauseCommandIssued",
    "PlaybackController.PlayCommandIssued",
    "PlaybackController.PreviousCommandIssued",
    "AlexaSkillEvent.SkillAccountLinked",
    "AlexaSkillEvent.SkillEnabled",
    "AlexaSkillEvent.SkillDisabled",
    "AlexaSkillEvent.SkillPermissionAccepted",
    "AlexaSkillEvent.SkillPermissionChanged",
    "AlexaHouseholdListEvent.ItemsCreated",
    "AlexaHouseholdListEvent.ItemsUpdated",
    "AlexaHouseholdListEvent.ItemsDeleted",
    "Display.ElementSelected",
];
var AlexaAdapter = /** @class */ (function (_super) {
    __extends(AlexaAdapter, _super);
    function AlexaAdapter(voxaApp) {
        var _this = _super.call(this, voxaApp) || this;
        _.map([directives_1.HomeCard, directives_1.DialogDelegate, directives_1.RenderTemplate, directives_1.AccountLinkingCard, directives_1.Hint, directives_1.PlayAudio], function (handler) { return voxaApp.registerDirectiveHandler(handler, handler.name); });
        _this.app.onAfterStateChanged(function (voxaEvent, reply, transition) { return AlexaAdapter.partialReply(voxaEvent, reply); });
        _.forEach(AlexaRequests, function (requestType) { return voxaApp.registerRequestHandler(requestType); });
        return _this;
    }
    /*
     * Sends a partial reply after every state change
     */
    AlexaAdapter.partialReply = function (event, reply) {
        return __awaiter(this, void 0, void 0, function () {
            var endpoint, authorizationToken, requestId, speech, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!_.get(event, "context.System.apiEndpoint")) {
                            return [2 /*return*/, null];
                        }
                        if (reply.isYielding()) {
                            return [2 /*return*/, null];
                        }
                        endpoint = url.resolve(event.context.System.apiEndpoint, "/v1/directives");
                        authorizationToken = event.context.System.apiAccessToken;
                        requestId = event.request.requestId;
                        speech = ssml_1.toSSML(reply.response.statements.join("\n"));
                        if (!speech) {
                            return [2 /*return*/, null];
                        }
                        body = {
                            directive: {
                                speech: speech,
                                type: "VoicePlayer.Speak",
                            },
                            header: {
                                requestId: requestId,
                            },
                        };
                        log("apiRequest");
                        log(body);
                        return [4 /*yield*/, AlexaAdapter.apiRequest(endpoint, body, authorizationToken)];
                    case 1:
                        _a.sent();
                        reply.clear();
                        return [2 /*return*/];
                }
            });
        });
    };
    AlexaAdapter.apiRequest = function (endpoint, body, authorizationToken) {
        var requestOptions = {
            auth: {
                bearer: authorizationToken,
            },
            body: body,
            json: true,
            method: "POST",
            uri: endpoint,
        };
        return rp(requestOptions);
    };
    AlexaAdapter.prototype.execute = function (rawEvent, context) {
        return __awaiter(this, void 0, void 0, function () {
            var alexaEvent, reply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent, context);
                        return [4 /*yield*/, this.app.execute(alexaEvent, AlexaReply_1.AlexaReply)];
                    case 1:
                        reply = _a.sent();
                        return [2 /*return*/, JSON.parse(JSON.stringify(reply))];
                }
            });
        });
    };
    return AlexaAdapter;
}(VoxaAdapter_1.VoxaAdapter));
exports.AlexaAdapter = AlexaAdapter;
//# sourceMappingURL=AlexaAdapter.js.map