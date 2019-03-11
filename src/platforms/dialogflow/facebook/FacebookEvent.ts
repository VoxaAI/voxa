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

import * as _ from "lodash";
import rp = require("request-promise");

import { IVoxaUserProfile } from "../../../VoxaEvent";
import { DialogflowEvent } from "../DialogflowEvent";

export class FacebookEvent extends DialogflowEvent {
  public facebook = {
    passThreadControl: this.passThreadControl.bind(this),
    passThreadControlToPageInbox: this.passThreadControlToPageInbox.bind(this),
    requestThreadControl: this.requestThreadControl.bind(this),
    sendFacebookAction: this.sendFacebookAction.bind(this),
    sendMarkSeenAction: this.sendMarkSeenAction.bind(this),
    sendTypingOffAction: this.sendTypingOffAction.bind(this),
    sendTypingOnAction: this.sendTypingOnAction.bind(this),
    takeThreadControl: this.takeThreadControl.bind(this),
  };

  get supportedInterfaces(): string[] {
    // FACEBOOK MESSENGER DOES NOT HAVE INTERFACES
    return [];
  }

  public async getUserInformation(
    userFields?: FACEBOOK_USER_FIELDS|FACEBOOK_USER_FIELDS[],
  ): Promise<IVoxaFacebookUserProfile> {
    let fields: string = FACEBOOK_USER_FIELDS.BASIC;

    if (_.isArray(userFields)) {
      fields = _.join(userFields, ",");
    } else if (!_.isUndefined(userFields)) {
      fields = userFields.toString();
    }

    const result: any = await this.getFacebookProfile(fields);

    result.firstName = result.first_name;
    result.lastName = result.last_name;
    result.profilePic = result.profile_pic;

    delete result.first_name;
    delete result.last_name;
    delete result.profile_pic;

    return result as IVoxaFacebookUserProfile;
  }

  protected initUser(): void {
    const { originalDetectIntentRequest } = this.rawEvent;
    const userId = _.get(originalDetectIntentRequest, "payload.data.sender.id");

    this.user = {
      id: userId,
      userId,
    };
  }

  private async sendFacebookRequest(path: string, body?: any) {
    const params: any = {
      json: true,
      method: "GET",
      uri: `https://graph.facebook.com/v3.2/me/${path}?access_token=${this.platform.config.pageAccessToken}`,
    };

    if (body) {
      body.recipient = { id: this.user.id };
      params.body = body;
      params.method = "POST";
    }

    await rp(params);
  }

  private async passThreadControl(targetAppId: string, metadata?: string) {
    const body: any = {
      target_app_id: targetAppId,
    };

    if (metadata) {
      body.metadata = metadata;
    }

    await this.sendFacebookRequest("pass_thread_control", body);
  }

  private async passThreadControlToPageInbox(metadata?: string) {
    await this.passThreadControl(PAGE_INBOX_ID, metadata);
  }

  private async requestThreadControl(metadata?: string) {
    let body;

    if (metadata) {
      body = { metadata };
    }

    await this.sendFacebookRequest("request_thread_control", body);
  }

  private async takeThreadControl(metadata?: string) {
    let body;

    if (metadata) {
      body = { metadata };
    }

    await this.sendFacebookRequest("take_thread_control", body);
  }

  private async sendFacebookAction(event: FACEBOOK_ACTIONS) {
    const body = {
      sender_action: event,
    };

    await this.sendFacebookRequest("messages", body);
  }

  private async sendMarkSeenAction() {
    await this.sendFacebookAction(FACEBOOK_ACTIONS.MARK_SEEN);
  }

  private async sendTypingOnAction() {
    await this.sendFacebookAction(FACEBOOK_ACTIONS.TYPING_ON);
  }

  private async sendTypingOffAction() {
    await this.sendFacebookAction(FACEBOOK_ACTIONS.TYPING_OFF);
  }

  private getFacebookProfile(fields: string) {
    const queryStringParams = {
      access_token: this.platform.config.pageAccessToken,
      fields,
    };

    const httpOptions: any = {
      json: true,
      method: "GET",
      qs: queryStringParams,
      qsStringifyOptions: { encode: false },
      uri: `https://graph.facebook.com/${this.user.id}`,
    };

    return rp(httpOptions);
  }
}

/*
 * Checkout https://developers.facebook.com/docs/messenger-platform/handover-protocol/pass-thread-control#page_inbox
 * For more information about passing control from Facebook app to Page Inbox
 */
export const PAGE_INBOX_ID = "263902037430900";

export enum FACEBOOK_USER_FIELDS {
  ALL = "first_name,gender,id,last_name,locale,name,profile_pic,timezone",
  BASIC = "first_name,last_name,profile_pic",
  FIRST_NAME = "first_name",
  GENDER = "gender",
  ID = "id",
  LAST_NAME = "last_name",
  LOCALE = "locale",
  NAME = "name",
  PROFILE_PIC = "profile_pic",
  TIMEZONE = "timezone",
}

export enum FACEBOOK_ACTIONS {
  MARK_SEEN = "mark_seen",
  TYPING_ON = "typing_on",
  TYPING_OFF = "typing_off",
}

export interface IVoxaFacebookUserProfile extends IVoxaUserProfile {
  firstName: string;
  lastName: string;
  profilePic: string;
  locale: string;
  timezone: number;
  gender: string;
}
