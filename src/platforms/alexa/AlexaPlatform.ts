import * as _ from "lodash";

import { ResponseBody } from "alexa-sdk";

import { VoxaApp } from "../../VoxaApp";
import { VoxaPlatform } from "../VoxaPlatform";
import { AlexaEvent } from "./AlexaEvent";
import { AlexaReply } from "./AlexaReply";
import { AccountLinkingCard, DialogDelegate, Hint, HomeCard, PlayAudio, RenderTemplate, StopAudio } from "./directives";

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

export class AlexaPlatform extends VoxaPlatform {
  public platform: string = "alexa";

  public getDirectiveHandlers() {
    return [
      AccountLinkingCard,
      DialogDelegate,
      Hint,
      HomeCard,
      PlayAudio,
      RenderTemplate,
      StopAudio,
    ];
  }

  public getPlatformRequests() {
    return AlexaRequests;
  }

  public async execute(rawEvent: any, context: any): Promise<ResponseBody> {
    const alexaEvent = new AlexaEvent(rawEvent, context);
    const reply = await this.app.execute(alexaEvent, new AlexaReply()) as AlexaReply;

    if (alexaEvent.model) {
      await reply.setSession(alexaEvent.model);
    }

    return reply;
  }
}
