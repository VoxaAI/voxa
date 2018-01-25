import * as debug from "debug";
import * as _ from "lodash";
import * as rp from "request-promise";
import * as url from "url";

import { OutputSpeech, Response, ResponseBody, Template } from "alexa-sdk";

import { toSSML } from "../../ssml";
import { ITransition } from "../../StateMachine";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { VoxaPlatform } from "../VoxaPlatform";
import { AlexaEvent } from "./AlexaEvent";
import { AlexaReply } from "./AlexaReply";
import { AccountLinkingCard, DialogDelegate, Hint, HomeCard, PlayAudio, RenderTemplate } from "./directives";

const log: debug.IDebugger = debug("voxa");

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

  constructor(voxaApp: VoxaApp) {
    super(voxaApp);
    _.forEach(AlexaRequests, (requestType) => voxaApp.registerRequestHandler(requestType));
    this.app.directiveHandlers.push(AccountLinkingCard);
    this.app.directiveHandlers.push(DialogDelegate);
    this.app.directiveHandlers.push(Hint);
    this.app.directiveHandlers.push(HomeCard);
    this.app.directiveHandlers.push(PlayAudio);
    this.app.directiveHandlers.push(RenderTemplate);
  }

  public async execute(rawEvent: any, context: any): Promise<ResponseBody> {
    const alexaEvent = new AlexaEvent(rawEvent, context);
    const reply: AlexaReply = await this.app.execute(alexaEvent, new AlexaReply()) as AlexaReply;

    if (alexaEvent.model) {
      await reply.setSession(alexaEvent.model);
    }

    return reply;
  }
}
