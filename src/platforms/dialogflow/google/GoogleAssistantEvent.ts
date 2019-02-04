/*
 * Copyright (c) 2019 Rain Agency <contact@rain.agency>
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

import { OAuth2Client } from "google-auth-library";
import { TokenPayload } from "google-auth-library/build/src/auth/loginticket";
import * as _ from "lodash";

import { IVoxaUserProfile } from "../../../VoxaEvent";
import { DialogflowEvent } from "../DialogflowEvent";

export class GoogleAssistantEvent extends DialogflowEvent {

  get supportedInterfaces(): string[] {
    let capabilities = _.map(
      this.dialogflow.conv.surface.capabilities.list,
      "name",
    );
    capabilities = _.filter(capabilities);

    return capabilities as string[];
  }

  public source: string = "google";

  public async verifyProfile(): Promise<TokenPayload | undefined> {
    const client = new OAuth2Client(this.platform.config.clientId);
    const payload:
      | TokenPayload
      | undefined = await this.dialogflow.conv.user._verifyProfile(
      client,
      this.platform.config.clientId,
    );

    return payload;
  }

  public async getUserInformation(): Promise<IVoxaGoogleUserProfile> {
    const voxaEvent: any = _.cloneDeep(this);
    const dialogflowUser = this.dialogflow.conv.user;

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
