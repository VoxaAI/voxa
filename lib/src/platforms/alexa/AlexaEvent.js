"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const VoxaEvent_1 = require("../../VoxaEvent");
const AlexaIntent_1 = require("./AlexaIntent");
class AlexaEvent extends VoxaEvent_1.IVoxaEvent {
    constructor(event, context) {
        super(event, context);
        this.requestToIntent = {
            "AlexaSkillEvent.SkillDisabled": "AlexaSkillEvent.SkillDisabled",
            "AlexaSkillEvent.SkillEnabled": "AlexaSkillEvent.SkillEnabled",
            "AudioPlayer.PlaybackFailed": "AudioPlayer.PlaybackFailed",
            "AudioPlayer.PlaybackFinished": "AudioPlayer.PlaybackFinished",
            "AudioPlayer.PlaybackNearlyFinished": "AudioPlayer.PlaybackNearlyFinished",
            "AudioPlayer.PlaybackStarted": "AudioPlayer.PlaybackStarted",
            "AudioPlayer.PlaybackStopped": "AudioPlayer.PlaybackStopped",
            "Display.ElementSelected": "Display.ElementSelected",
            "LaunchRequest": "LaunchIntent",
            "PlaybackController.NextCommandIssued": "PlaybackController.NextCommandIssued",
            "PlaybackController.PauseCommandIssued": "PlaybackController.PauseCommandIssued",
            "PlaybackController.PlayCommandIssued": "PlaybackController.PlayCommandIssued",
            "PlaybackController.PreviousCommandIssued": "PlaybackController.PreviousCommandIssued",
        };
        this.session = _.cloneDeep(event.session);
        this.request = _.cloneDeep(event.request);
        this.context = _.cloneDeep(event.context);
        this.executionContext = context;
        if (_.isEmpty(_.get(this, "session.attributes"))) {
            _.set(this, "session.attributes", {});
        }
        this.mapRequestToIntent();
        if (!this.intent) {
            this.intent = new AlexaIntent_1.AlexaIntent(this.request.intent);
        }
        this.platform = "alexa";
    }
    get user() {
        return _.get(this, "session.user") || _.get(this, "context.System.user");
    }
    get token() {
        return _.get(this, "request.token");
    }
    get supportedInterfaces() {
        const interfaces = _.get(this, "context.System.device.supportedInterfaces", {});
        return _.keys(interfaces);
    }
}
exports.AlexaEvent = AlexaEvent;
//# sourceMappingURL=AlexaEvent.js.map