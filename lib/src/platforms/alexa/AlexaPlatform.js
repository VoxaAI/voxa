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
const VoxaPlatform_1 = require("../VoxaPlatform");
const AlexaEvent_1 = require("./AlexaEvent");
const AlexaReply_1 = require("./AlexaReply");
const directives_1 = require("./directives");
const alexalog = debug("voxa:alexa");
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
class AlexaPlatform extends VoxaPlatform_1.VoxaPlatform {
    constructor() {
        super(...arguments);
        this.platform = "alexa";
    }
    getDirectiveHandlers() {
        return [
            directives_1.AccountLinkingCard,
            directives_1.DialogDelegate,
            directives_1.Hint,
            directives_1.HomeCard,
            directives_1.PlayAudio,
            directives_1.RenderTemplate,
            directives_1.StopAudio,
        ];
    }
    getPlatformRequests() {
        return AlexaRequests;
    }
    execute(rawEvent, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const alexaEvent = new AlexaEvent_1.AlexaEvent(rawEvent, context);
            const reply = yield this.app.execute(alexaEvent, new AlexaReply_1.AlexaReply());
            alexalog("Reply: ", JSON.stringify(reply, null, 2));
            return reply;
        });
    }
}
exports.AlexaPlatform = AlexaPlatform;
//# sourceMappingURL=AlexaPlatform.js.map