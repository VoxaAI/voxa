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
import * as _ from "lodash";

import { IVoxaEvent, IVoxaIntent, IVoxaSession } from "../../VoxaEvent";
import { AlexaIntent } from "./AlexaIntent";
import {
  CustomerContact,
  DeviceAddress,
  DeviceSettings,
  InSkillPurchase,
  Lists,
} from "./apis";

export class AlexaEvent extends IVoxaEvent {
  public platform: "alexa" = "alexa";
  public intent!: IVoxaIntent;
  public alexa!: {
    customerContact: CustomerContact;
    deviceAddress: DeviceAddress;
    deviceSettings: DeviceSettings;
    isp: InSkillPurchase;
    lists: Lists;
  };

  public requestToIntent: any = {
    "AlexaSkillEvent.SkillDisabled": "AlexaSkillEvent.SkillDisabled",
    "AlexaSkillEvent.SkillEnabled": "AlexaSkillEvent.SkillEnabled",
    "AudioPlayer.PlaybackFailed": "AudioPlayer.PlaybackFailed",
    "AudioPlayer.PlaybackFinished": "AudioPlayer.PlaybackFinished",
    "AudioPlayer.PlaybackNearlyFinished": "AudioPlayer.PlaybackNearlyFinished",
    "AudioPlayer.PlaybackStarted": "AudioPlayer.PlaybackStarted",
    "AudioPlayer.PlaybackStopped": "AudioPlayer.PlaybackStopped",
    "Connections.Response": "Connections.Response",
    "Display.ElementSelected": "Display.ElementSelected",
    "GameEngine.InputHandlerEvent": "GameEngine.InputHandlerEvent",
    "LaunchRequest": "LaunchIntent",
    "PlaybackController.NextCommandIssued":
      "PlaybackController.NextCommandIssued",
    "PlaybackController.PauseCommandIssued":
      "PlaybackController.PauseCommandIssued",
    "PlaybackController.PlayCommandIssued":
      "PlaybackController.PlayCommandIssued",
    "PlaybackController.PreviousCommandIssued":
      "PlaybackController.PreviousCommandIssued",
  };

  constructor(event: RequestEnvelope, context?: any) {
    super(event, context);

    this.request = {
      locale: event.request.locale,
      type: event.request.type,
    };

    this.initSession();
    this.initIntents();
    this.mapRequestToIntent();
    this.initApis();
  }

  get user() {
    return (
      _.get(this.rawEvent, "session.user") ||
      _.get(this.rawEvent, "context.System.user")
    );
  }

  get token() {
    return _.get(this.rawEvent, "request.token");
  }

  get supportedInterfaces() {
    const interfaces = _.get(
      this.rawEvent,
      "context.System.device.supportedInterfaces",
      {},
    );
    return _.keys(interfaces);
  }

  protected initApis() {
    this.alexa = {
      customerContact: new CustomerContact(this.rawEvent),
      deviceAddress: new DeviceAddress(this.rawEvent),
      deviceSettings: new DeviceSettings(this.rawEvent),
      isp: new InSkillPurchase(this.rawEvent),
      lists: new Lists(this.rawEvent),
    };
  }

  protected initSession() {
    this.session = {
      attributes: _.get(this.rawEvent, "session.attributes", {}),
      new: _.get(this.rawEvent, "session.new", false),
      outputAttributes: {},
      sessionId: _.get(this.rawEvent, "session.sessionId", ""),
    };
  }

  protected initIntents() {
    if (this.request.type === "IntentRequest") {
      this.intent = new AlexaIntent(this.rawEvent.request.intent);
    }

    if (this.request.type === "CanFulfillIntentRequest") {
      this.intent = new AlexaIntent(this.rawEvent.request.intent);
    }
  }
}
