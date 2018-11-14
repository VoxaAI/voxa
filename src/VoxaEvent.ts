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

import { Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext } from "azure-functions-ts-essentials";
import * as i18n from "i18next";
import * as jwt from "jsonwebtoken";
import { LambdaLog, LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import * as rp from "request-promise";
import { Model } from "./Model";
import { DialogFlowEvent } from "./platforms/dialogflow/DialogFlowEvent";
import { VoxaPlatform } from "./platforms/VoxaPlatform";
import { Renderer } from "./renderers/Renderer";

export interface ITypeMap {
  [x: string]: string;
}

export interface IVoxaRequest {
  locale: string;
  type: string;
}

export interface IVoxaEventClass {
  new (rawEvent: any, logOptions: LambdaLogOptions, context: any): IVoxaEvent;
}

export interface IVoxaIntentEvent extends IVoxaEvent {
  intent: IVoxaIntent;
}

export interface IVoxaEvent {
  rawEvent: any; // the raw event as sent by the service
  session: IVoxaSession;
  intent?: IVoxaIntent;
  request: IVoxaRequest;
  model: Model;
  t: i18n.TranslationFunction;
  log: LambdaLog;
  renderer: Renderer;
  user: IVoxaUser;
  platform: VoxaPlatform;
  supportedInterfaces: string[];
  executionContext?: AWSLambdaContext | AzureContext;
}

export abstract class VoxaEvent implements IVoxaEvent {
  public abstract get supportedInterfaces(): string[];
  public rawEvent: any; // the raw event as sent by the service
  public session!: IVoxaSession;
  public intent?: IVoxaIntent;
  public request!: IVoxaRequest;
  public model!: Model;
  public t!: i18n.TranslationFunction;
  public log!: LambdaLog;
  public renderer!: Renderer;
  public user!: IVoxaUser;
  public platform!: VoxaPlatform;
  protected requestToIntent: ITypeMap = {};
  protected requestToRequest: ITypeMap = {};

  constructor(
    rawEvent: any,
    logOptions: LambdaLogOptions = {},
    public executionContext?: AWSLambdaContext | AzureContext,
  ) {
    this.rawEvent = _.cloneDeep(rawEvent);
    this.initSession();
    this.initUser();
    this.initLogger(logOptions);
  }

  public async getUserInformation(): Promise<any> {
    if (_.has(this, "google")) {
      return this.getUserInformationWithGoogle();
    }

    return await this.getUserInformationWithLWA();
  }

  public getUserInformationWithGoogle(): any {
    const result: any = jwt.decode(this.user.idToken);
    result.emailVerified = result.email_verified;
    result.familyName = result.family_name;
    result.givenName = result.given_name;

    delete result.email_verified;
    delete result.family_name;
    delete result.given_name;

    return result;
  }

  public async getUserInformationWithLWA(): Promise<any> {
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

    return result;
  }

  protected abstract initSession(): void;
  protected abstract initUser(): void;

  protected mapRequestToRequest(): void {
    const requestType = this.request.type;
    const newRequestType = this.requestToRequest[requestType];

    if (!newRequestType) {
      return;
    }

    this.request.type = newRequestType;
  }

  protected mapRequestToIntent(): void {
    const requestType = this.request.type;
    const intentName = this.requestToIntent[requestType];

    if (!intentName) {
      return;
    }

    this.intent = {
      name: intentName,
      params: {},
    };

    this.request.type = "IntentRequest";
  }

  protected initLogger(logOptions: LambdaLogOptions): void {
    logOptions = _.cloneDeep(logOptions);
    _.set(logOptions, "meta.sessionId", this.session.sessionId);
    this.log = new LambdaLog(logOptions);
  }
}

export interface IVoxaUser {
  id: string;
  userId: string;
  accessToken?: string;
  [key: string]: any;
}

export interface IVoxaIntent {
  rawIntent?: any;
  name: string;
  params: any;
}

export interface IBag extends Object {
  [key: string]: any;
}

export interface IVoxaSession {
  // Session attributes that are inbound on the event.
  // These have been set by in the prior event by setting the outputAttributes.
  attributes: IBag;

  // Attributes that will be carried forward into the next event.
  outputAttributes: IBag;

  // True if this request is the first in the session.
  new: boolean;
  sessionId: string;
}
