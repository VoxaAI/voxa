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

import {
  canfulfill,
  IntentRequest,
  RequestEnvelope,
  User as IAlexaUser,
} from "ask-sdk-model";
import { Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext } from "azure-functions-ts-essentials";
import { LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import rp = require("request-promise");

import { IVoxaIntent, IVoxaUserProfile, VoxaEvent } from "../../VoxaEvent";
import { AlexaIntent } from "./AlexaIntent";
import {
  CustomerContact,
  DeviceAddress,
  DeviceSettings,
  InSkillPurchase,
  Lists,
  Reminders,
} from "./apis";
import { isLocalizedRequest } from "./utils";

export class AlexaEvent extends VoxaEvent {
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
  public intent?: IVoxaIntent;
  public rawEvent!: RequestEnvelope;
  public alexa!: {
    customerContact: CustomerContact;
    deviceAddress: DeviceAddress;
    deviceSettings: DeviceSettings;
    isp: InSkillPurchase;
    lists: Lists;
    reminders: Reminders;
  };

  public requestToIntent: any = {
    "Alexa.Presentation.APL.UserEvent": "Alexa.Presentation.APL.UserEvent",
    "Alexa.Presentation.APLT.UserEvent": "Alexa.Presentation.APLT.UserEvent",
    "Connections.Response": "Connections.Response",
    "Display.ElementSelected": "Display.ElementSelected",
    "GameEngine.InputHandlerEvent": "GameEngine.InputHandlerEvent",
    "LaunchRequest": "LaunchIntent",
  };

  constructor(
    rawEvent: RequestEnvelope,
    logOptions?: LambdaLogOptions,
    executionContext?: AWSLambdaContext | AzureContext,
  ) {
    super(rawEvent, logOptions, executionContext);

    const locale: string = isLocalizedRequest(rawEvent.request)
      ? (rawEvent.request.locale as string)
      : "en-us";

    this.request = {
      locale,
      type: rawEvent.request.type,
    };

    this.initIntents();
    this.mapRequestToIntent();
    this.initApis();
    this.initUser();
  }

  public async getUserInformation(): Promise<IVoxaAlexaUserProfile> {
    if (!this.user.accessToken) {
      throw new Error("this.user.accessToken is empty");
    }

    const httpOptions: any = {
      json: true,
      method: "GET",
      uri: `https://api.amazon.com/user/profile?access_token=${this.user.accessToken}`,
    };

    const result: any = await rp(httpOptions);
    result.zipCode = result.postal_code;
    result.userId = result.user_id;

    delete result.postal_code;
    delete result.user_id;

    return result as IVoxaAlexaUserProfile;
  }

  protected initUser() {
    const user: IAlexaUser =
      _.get(this.rawEvent, "session.user") ||
      _.get(this.rawEvent, "context.System.user");

    if (!user) {
      return;
    }

    this.user = {
      accessToken: user.accessToken,
      id: user.userId,
      userId: user.userId,
    };
  }

  protected initApis() {
    this.alexa = {
      customerContact: new CustomerContact(this.rawEvent, this.log),
      deviceAddress: new DeviceAddress(this.rawEvent, this.log),
      deviceSettings: new DeviceSettings(this.rawEvent, this.log),
      isp: new InSkillPurchase(this.rawEvent, this.log),
      lists: new Lists(this.rawEvent, this.log),
      reminders: new Reminders(this.rawEvent, this.log),
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
    const { request } = this.rawEvent;
    if (isIntentRequest(request)) {
      this.intent = new AlexaIntent(request.intent);
    }
  }
}

function isIntentRequest(
  request: any,
): request is IntentRequest | canfulfill.CanFulfillIntentRequest {
  return (
    request.type === "IntentRequest" ||
    request.type === "CanFulfillIntentRequest"
  );
}

export interface IVoxaAlexaUserProfile extends IVoxaUserProfile {
  userId: string;
  zipCode: string;
}
