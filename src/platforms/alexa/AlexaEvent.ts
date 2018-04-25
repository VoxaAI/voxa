import * as alexa from "alexa-sdk";
import { IntentRequest, SlotValue } from "alexa-sdk";
import { i18n, TranslationFunction } from "i18next";
import * as _ from "lodash";
import { Model } from "../../Model";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
import { AlexaIntent } from "./AlexaIntent";

export interface IAlexaRequest extends alexa.RequestBody<alexa.Request> {
  context: any;
}

export interface ILaunchRequest extends alexa.RequestBody<alexa.LaunchRequest> {
  context: any;
}

export interface ISessionEndedRequest extends alexa.RequestBody<alexa.SessionEndedRequest> {
  context: any;
}

export class AlexaEvent extends IVoxaEvent {
  public intent!: IVoxaIntent;

  public requestToIntent: any = {
    "AudioPlayer.PlaybackStarted": "AudioPlayer.PlaybackStarted",
    "AudioPlayer.PlaybackFinished": "AudioPlayer.PlaybackFinished",
    "AudioPlayer.PlaybackStopped": "AudioPlayer.PlaybackStopped",
    "AudioPlayer.PlaybackFailed": "AudioPlayer.PlaybackFailed",
    "AudioPlayer.PlaybackNearlyFinished": "AudioPlayer.PlaybackNearlyFinished",
    "Display.ElementSelected": "Display.ElementSelected",
    "LaunchRequest": "LaunchIntent",
    "PlaybackController.NextCommandIssued": "PlaybackController.NextCommandIssued",
    "PlaybackController.PauseCommandIssued": "PlaybackController.PauseCommandIssued",
    "PlaybackController.PlayCommandIssued": "PlaybackController.PlayCommandIssued",
    "PlaybackController.PreviousCommandIssued": "PlaybackController.PreviousCommandIssued",
  };

  constructor(event: IAlexaRequest , context?: any) {
    super(event, context);
    this.session = _.cloneDeep(event.session);
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
}
