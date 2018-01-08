"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const debug = require("debug");
const _ = require("lodash");
const rp = require("request-promise");
const url = require("url");
const ssml_1 = require("../../ssml");
const VoxaAdapter_1 = require("../VoxaAdapter");
const AlexaEvent_1 = require("./AlexaEvent");
const AlexaReply_1 = require("./AlexaReply");
const directives_1 = require("./directives");
const log = debug("voxa");
const AlexaRequests = [
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
class AlexaAdapter extends VoxaAdapter_1.VoxaAdapter {
    /*
     * Sends a partial reply after every state change
     */
    static partialReply(event, reply) {
        if (!_.get(event, "context.System.apiEndpoint")) {
            return Promise.resolve(null);
        }
        if (reply.isYielding()) {
            return Promise.resolve(null);
        }
        const endpoint = url.resolve(event.context.System.apiEndpoint, "/v1/directives");
        const authorizationToken = event.context.System.apiAccessToken;
        const requestId = event.request.requestId;
        const speech = ssml_1.toSSML(reply.response.statements.join("\n"));
        if (!speech) {
            return Promise.resolve(null);
        }
        const body = {
            directive: {
                speech,
                type: "VoicePlayer.Speak",
            },
            header: {
                requestId,
            },
        };
        log("apiRequest");
        log(body);
        return AlexaAdapter.apiRequest(endpoint, body, authorizationToken)
            .then(() => {
            reply.clear();
        });
    }
    static apiRequest(endpoint, body, authorizationToken) {
        const requestOptions = {
            auth: {
                bearer: authorizationToken,
            },
            body,
            json: true,
            method: "POST",
            uri: endpoint,
        };
        return rp(requestOptions);
    }
    constructor(voxaApp) {
        super(voxaApp);
        _.map([directives_1.HomeCard, directives_1.DialogDelegate, directives_1.RenderTemplate, directives_1.AccountLinkingCard, directives_1.Hint, directives_1.PlayAudio], (handler) => voxaApp.registerDirectiveHandler(handler, handler.name));
        this.app.onAfterStateChanged((voxaEvent, reply, transition) => AlexaAdapter.partialReply(voxaEvent, reply));
        _.forEach(AlexaRequests, (requestType) => voxaApp.registerRequestHandler(requestType));
    }
    execute(rawEvent, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent, context);
            const reply = yield this.app.execute(alexaEvent, AlexaReply_1.AlexaReply);
            return reply.toJSON();
        });
    }
}
exports.AlexaAdapter = AlexaAdapter;
//# sourceMappingURL=AlexaAdapter.js.map