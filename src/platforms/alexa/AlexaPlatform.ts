import * as _ from "lodash";

import { ResponseEnvelope } from "ask-sdk-model";

import * as debug from "debug";
import { VoxaApp } from "../../VoxaApp";
import { VoxaPlatform } from "../VoxaPlatform";
import { AlexaEvent } from "./AlexaEvent";
import { AlexaReply } from "./AlexaReply";
import {
  AccountLinkingCard,
  ConnectionsSendRequest,
  DialogDelegate,
  GadgetControllerLightDirective,
  GameEngineStartInputHandler,
  GameEngineStopInputHandler,
  Hint,
  HomeCard,
  PlayAudio,
  RenderTemplate,
  StopAudio,
} from "./directives";

const alexalog: debug.IDebugger = debug("voxa:alexa");

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
  "Connections.Response",
  "Display.ElementSelected",
  "CanFulfillIntentRequest",
  "GameEngine.InputHandlerEvent",
];

export class AlexaPlatform extends VoxaPlatform {
  public platform: string = "alexa";
  public defaultFulfillIntents: string[] = [];

  constructor(voxaApp: VoxaApp, config: any= {}) {
    super(voxaApp, config);

    this.defaultFulfillIntents = config.defaultFulfillIntents;

    this.app.onCanFulfillIntentRequest((event: AlexaEvent, reply: AlexaReply) => {
      if (_.includes(this.defaultFulfillIntents, event.intent.name)) {
        reply.fulfillIntent("YES");

        _.each(event.intent.params, (value, slotName) => {
          reply.fulfillSlot(slotName, "YES", "YES");
        });
      }

      return reply;
    });
  }

  public getDirectiveHandlers() {
    return [
      AccountLinkingCard,
      ConnectionsSendRequest,
      DialogDelegate,
      GadgetControllerLightDirective,
      GameEngineStartInputHandler,
      GameEngineStopInputHandler,
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

  public async execute(rawEvent: any, context: any): Promise<ResponseEnvelope> {
    const alexaEvent = new AlexaEvent(rawEvent, context);
    const reply = await this.app.execute(alexaEvent, new AlexaReply()) as AlexaReply;
    alexalog("Reply: ", JSON.stringify(reply, null, 2));
    return reply;
  }
}
