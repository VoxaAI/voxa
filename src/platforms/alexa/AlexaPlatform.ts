import * as _ from "lodash";

import { RequestEnvelope, ResponseEnvelope } from "ask-sdk-model";
import { OnSessionEndedError } from "../../errors";
import { IVoxaReply } from "../../VoxaReply";

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

export interface IAlexaPlatformConfig {
  appIds?: string | string[];
  defaultFulfillIntents?: string[];
}

export class AlexaPlatform extends VoxaPlatform {
  public platform: string = "alexa";
  public config: IAlexaPlatformConfig;

  constructor(voxaApp: VoxaApp, config: IAlexaPlatformConfig = {}) {
    super(voxaApp, config);
    this.config = config;

    this.app.onCanFulfillIntentRequest(
      (event: AlexaEvent, reply: AlexaReply) => {
        if (_.includes(this.config.defaultFulfillIntents, event.intent.name)) {
          reply.fulfillIntent("YES");

          _.each(event.intent.params, (value, slotName) => {
            reply.fulfillSlot(slotName, "YES", "YES");
          });
        }

        return reply;
      },
    );
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

  public async execute(
    rawEvent: RequestEnvelope,
    context: any,
  ): Promise<ResponseEnvelope | AlexaReply> {
    this.checkAppIds(rawEvent);

    const alexaEvent = new AlexaEvent(rawEvent, context);
    try {
      this.checkSessionEndedRequest(alexaEvent);

      const reply = (await this.app.execute(
        alexaEvent,
        new AlexaReply(),
      )) as AlexaReply;
      alexalog("Reply: ", JSON.stringify(reply, null, 2));
      return reply;
    } catch (error) {
      return (await this.app.handleErrors(
        alexaEvent,
        error,
        new AlexaReply(),
      )) as AlexaReply;
    }
  }

  protected checkSessionEndedRequest(alexaEvent: AlexaEvent): void {
    if (
      alexaEvent.request.type === "SessionEndedRequest" &&
      alexaEvent.rawEvent.request.reason === "ERROR"
    ) {
      throw new OnSessionEndedError(
        _.get(alexaEvent.rawEvent, "request.error"),
      );
    }
  }

  protected checkAppIds(rawEvent: RequestEnvelope): void {
    if (!this.config.appIds) {
      return;
    }

    // Validate that this AlexaRequest originated from authorized source.
    const appId = rawEvent.context.System.application.applicationId;

    const expectedAppids: string[] = _.isArray(this.config.appIds)
      ? this.config.appIds
      : [this.config.appIds];

    if (!_.includes(expectedAppids, appId)) {
      alexalog(
        `The applicationIds don't match: "${appId}"  and  "${expectedAppids}"`,
      );

      throw new Error("Invalid applicationId");
    }
  }
}
