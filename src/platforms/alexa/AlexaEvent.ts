import {
  IntentRequest,
  LaunchRequest,
  RequestEnvelope,
  SessionEndedRequest,
  Slot,
} from "ask-sdk-model";
import { i18n, TranslationFunction } from "i18next";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent, IVoxaSession } from "../../VoxaEvent";
import { AlexaIntent } from "./AlexaIntent";

export class AlexaEvent extends IVoxaEvent {
  public intent!: IVoxaIntent;

  public requestToIntent: any = {
    "AlexaSkillEvent.SkillDisabled": "AlexaSkillEvent.SkillDisabled",
    "AlexaSkillEvent.SkillEnabled": "AlexaSkillEvent.SkillEnabled",
    "AudioPlayer.PlaybackFailed": "AudioPlayer.PlaybackFailed",
    "AudioPlayer.PlaybackFinished": "AudioPlayer.PlaybackFinished",
    "AudioPlayer.PlaybackNearlyFinished": "AudioPlayer.PlaybackNearlyFinished",
    "AudioPlayer.PlaybackStarted": "AudioPlayer.PlaybackStarted",
    "AudioPlayer.PlaybackStopped": "AudioPlayer.PlaybackStopped",
    "Display.ElementSelected": "Display.ElementSelected",
    "GameEngine.InputHandlerEvent": "GameEngine.InputHandlerEvent",
    "LaunchRequest": "LaunchIntent",
    "PlaybackController.NextCommandIssued": "PlaybackController.NextCommandIssued",
    "PlaybackController.PauseCommandIssued": "PlaybackController.PauseCommandIssued",
    "PlaybackController.PlayCommandIssued": "PlaybackController.PlayCommandIssued",
    "PlaybackController.PreviousCommandIssued": "PlaybackController.PreviousCommandIssued",
  };

  constructor(event: RequestEnvelope , context?: any) {
    super(event, context);
    this.session = _.cloneDeep(event.session) as IVoxaSession;
    this.request = _.cloneDeep(event.request);
    this.context = _.cloneDeep(event.context);
    this.executionContext = context;

    if (_.isEmpty(_.get(this, "session.attributes"))) {
      _.set(this, "session.attributes", {});
    }

    this.mapRequestToIntent();

    if (!this.intent) {
      this.intent = new AlexaIntent(this.request.intent);
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
