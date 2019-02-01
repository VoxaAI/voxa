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
  DialogflowConversation,
  GoogleCloudDialogflowV2WebhookRequest,
} from "actions-on-google";
import { Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext } from "azure-functions-ts-essentials";
import { OAuth2Client } from "google-auth-library";
import { TokenPayload } from "google-auth-library/build/src/auth/loginticket";
import { LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import { v1 } from "uuid";
import { IVoxaUserProfile, VoxaEvent } from "../../../VoxaEvent";
import { DialogflowSession } from "../DialogflowSession";
import { GoogleAssistantIntent } from "./GoogleAssistantIntent";

export interface IGoogle {
  conv: DialogflowConversation;
}

export class GoogleAssistantEvent extends VoxaEvent {

  get supportedInterfaces(): string[] {
    let capabilities = _.map(
      this.google.conv.surface.capabilities.list,
      "name",
    );
    capabilities = _.filter(capabilities);

    return capabilities as string[];
  }
  public rawEvent!: GoogleCloudDialogflowV2WebhookRequest;
  public session!: DialogflowSession;
  public google!: IGoogle;
  public intent: GoogleAssistantIntent;
  public source: string = "google";

  constructor(
    rawEvent: GoogleCloudDialogflowV2WebhookRequest,
    logOptions?: LambdaLogOptions,
    executionContext?: AWSLambdaContext | AzureContext,
  ) {
    super(rawEvent, logOptions, executionContext);

    this.request = {
      locale: _.get(rawEvent.queryResult, "languageCode") || "",
      type: "IntentRequest",
    };

    this.intent = new GoogleAssistantIntent(this.google.conv);
  }

  public async verifyProfile(): Promise<TokenPayload | undefined> {
    const client = new OAuth2Client(this.platform.config.clientId);
    const payload:
      | TokenPayload
      | undefined = await this.google.conv.user._verifyProfile(
      client,
      this.platform.config.clientId,
    );

    return payload;
  }

  public async getUserInformation(): Promise<IVoxaGoogleUserProfile> {
    const voxaEvent: any = _.cloneDeep(this);
    const dialogflowUser = this.google.conv.user;

    if (!dialogflowUser.profile.token) {
      throw new Error("conv.user.profile.token is empty");
    }

    const result: any = await this.verifyProfile();

    result.emailVerified = result.email_verified;
    result.familyName = result.family_name;
    result.givenName = result.given_name;

    delete result.email_verified;
    delete result.family_name;
    delete result.given_name;

    return result as IVoxaGoogleUserProfile;
  }

  protected initSession(): void {
    this.google = {
      conv: new DialogflowConversation({
        body: this.rawEvent,
        headers: {},
      }),
    };

    this.session = new DialogflowSession(this.google.conv);
  }

  /**
   * conv.user.id is a deprecated feature that will be removed soon
   * this makes it so skills using voxa are future proof
   *
   * We use conv.user.id if it's available, but we store it in userStorage,
   * If there's no conv.user.id we generate a uuid.v1 and store it in userStorage
   *
   * After that we'll default to the userStorage value
   */
  protected initUser(): void {
    const { originalDetectIntentRequest } = this.rawEvent;
    const { conv } = this.google;
    const storage = conv.user.storage as any;
    let userId: string = "";

    if (conv.user.id) {
      userId = conv.user.id;
    } else if (_.get(storage, "voxa.userId")) {
      userId = storage.voxa.userId;
    } else {
      userId = v1();
    }

    _.set(this.google.conv.user.storage, "voxa.userId", userId);

    this.user = {
      accessToken: conv.user.access.token,
      id: userId,
      userId,
    };
  }
}

export interface IVoxaGoogleUserProfile extends IVoxaUserProfile {
  aud: string; // Client ID assigned to your Actions project
  emailVerified: boolean;
  exp: number; // Unix timestamp of the token's expiration time
  familyName: string;
  givenName: string;
  iat: number; // Unix timestamp of the token's creation time
  iss: string; // The token's issuer
  locale: string;
  sub: string; // The unique ID of the user's Google Account
}
