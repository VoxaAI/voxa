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
var _ = require("lodash");
var actions_on_google_1 = require("actions-on-google");
var ssml_1 = require("../../ssml");
var VoxaAdapter_1 = require("../VoxaAdapter");
var DialogFlowEvent_1 = require("./DialogFlowEvent");
var DialogFlowReply_1 = require("./DialogFlowReply");
var directives_1 = require("./directives");
var DialogFlowAdapter = /** @class */ (function (_super) {
    __extends(DialogFlowAdapter, _super);
    function DialogFlowAdapter(voxaApp) {
        var _this = _super.call(this, voxaApp) || this;
        _.map([directives_1.List, directives_1.Carousel, directives_1.Suggestions, directives_1.BasicCard], function (handler) { return voxaApp.registerDirectiveHandler(handler, handler.name); });
        return _this;
    }
    DialogFlowAdapter.sessionToContext = function (session) {
        if (!(session && !_.isEmpty(session.attributes))) {
            return [];
        }
        return _(session.attributes)
            .map(function (parameters, name) {
            if (!parameters || _.isEmpty(parameters)) {
                return;
            }
            var currentContext = { name: name, lifespan: 10000, parameters: {} };
            if (_.isPlainObject(parameters)) {
                currentContext.parameters = parameters;
            }
            else {
                currentContext.parameters[name] = parameters;
            }
            return currentContext;
        })
            .filter()
            .value();
    };
    DialogFlowAdapter.google = function (reply) {
        var speech = ssml_1.toSSML(reply.response.statements.join("\n"));
        var noInputPrompts = [];
        var possibleIntents;
        var richResponse = new actions_on_google_1.Responses.RichResponse();
        if (reply.response.reprompt) {
            noInputPrompts.push({
                ssml: reply.response.reprompt,
            });
        }
        if (speech) {
            richResponse.addSimpleResponse(speech);
        }
        _.map(reply.response.directives, function (directive) {
            if (directive.suggestions) {
                richResponse.addSuggestions(directive.suggestions);
            }
            else if (directive.basicCard) {
                richResponse.addBasicCard(directive.basicCard);
            }
            else if (directive.possibleIntents) {
                possibleIntents = directive.possibleIntents;
            }
        });
        return {
            expectUserResponse: !reply.response.terminate,
            isSsml: true,
            noInputPrompts: noInputPrompts,
            possibleIntents: possibleIntents,
            richResponse: richResponse,
        };
    };
    DialogFlowAdapter.toDialogFlowResponse = function (voxaReply) {
        var speech = ssml_1.toSSML(voxaReply.response.statements.join("\n"));
        var contextOut = DialogFlowAdapter.sessionToContext(voxaReply.session);
        var source = _.get(voxaReply, "voxaEvent.originalRequest.source");
        var integrations = {
            google: DialogFlowAdapter.google,
        };
        var response = {
            contextOut: contextOut,
            data: {},
            source: "Voxa",
            speech: speech,
        };
        if (integrations[source]) {
            response.data[source] = integrations[source](voxaReply);
        }
        return response;
    };
    DialogFlowAdapter.prototype.execute = function (rawEvent, context) {
        return __awaiter(this, void 0, void 0, function () {
            var event, voxaReply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        event = new DialogFlowEvent_1.DialogFlowEvent(rawEvent, context);
                        return [4 /*yield*/, this.app.execute(event, DialogFlowReply_1.DialogFlowReply)];
                    case 1:
                        voxaReply = _a.sent();
                        return [2 /*return*/, DialogFlowAdapter.toDialogFlowResponse(voxaReply)];
                }
            });
        });
    };
    return DialogFlowAdapter;
}(VoxaAdapter_1.VoxaAdapter));
exports.DialogFlowAdapter = DialogFlowAdapter;
//# sourceMappingURL=DialogFlowAdapter.js.map