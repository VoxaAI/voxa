/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { RequestEnvelope } from "ask-sdk-model";
import { Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext } from "azure-functions-ts-essentials";
import * as _ from "lodash";
import { OnSessionEndedError } from "../../errors";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaEvent, IVoxaIntentEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { IVoxaPlatformConfig, VoxaPlatform } from "../VoxaPlatform";
import { AlexaCanFullfillReply } from "./AlexaCanFullfillReply";
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

export interface IAlexaPlatformConfig extends IVoxaPlatformConfig {
  appIds?: string | string[];
  defaultFulfillIntents?: string[];
}

export class AlexaPlatform extends VoxaPlatform {
  public name: string = "alexa";
  public config: IAlexaPlatformConfig;

  protected EventClass = AlexaEvent;

  constructor(voxaApp: VoxaApp, config: IAlexaPlatformConfig = {}) {
    super(voxaApp, config);
    this.config = config;

    this.app.onCanFulfillIntentRequest(
      (event: IVoxaIntentEvent, reply: AlexaCanFullfillReply) => {
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
    context?: AWSLambdaContext | AzureContext,
  ): Promise<any> {
    this.checkAppIds(rawEvent);
    const alexaEvent = (await this.getEvent(rawEvent, context)) as AlexaEvent;
    const alexaReply = this.getReply(alexaEvent);

    try {
      this.checkSessionEndedRequest(alexaEvent);
      return this.app.execute(alexaEvent, alexaReply);
    } catch (error) {
      return this.app.handleErrors(alexaEvent, error, alexaReply);
    }
  }

  protected getReply(event: IVoxaEvent): IVoxaReply {
    if (event.request.type === "CanFulfillIntentRequest") {
      return new AlexaCanFullfillReply();
    }

    return new AlexaReply();
  }

  protected checkSessionEndedRequest(alexaEvent: AlexaEvent): void {
    const { request } = alexaEvent.rawEvent;
    if (request.type === "SessionEndedRequest" && request.reason === "ERROR") {
      throw new OnSessionEndedError(request.error);
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
      throw new Error("Invalid applicationId");
    }
  }
}
