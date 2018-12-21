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

import { EventsBuilder } from "../ProactiveEvents";

/**
 * Social Game Invite Events Builder class reference
 */
export class SocialGameInviteEventBuilder extends EventsBuilder {
  public game: any = {};
  public invite: any = {};

  constructor() {
    super("AMAZON.SocialGameInvite.Available");
  }

  public setGame(offer: SOCIAL_GAME_OFFER): SocialGameInviteEventBuilder {
    this.game = {
      name: "localizedattribute:gameName",
      offer,
    };

    return this;
  }

  public setInvite(
    name: string,
    inviteType: SOCIAL_GAME_INVITE_TYPE,
    relationshipToInvitee: SOCIAL_GAME_RELATIONSHIP_TO_INVITEE): SocialGameInviteEventBuilder {
    this.invite = {
      inviteType,
      inviter: {
        name,
      },
      relationshipToInvitee,
    };

    return this;
  }

  public getPayload(): any {
    return {
      game: this.game,
      invite: this.invite,
    };
  }
}

export enum SOCIAL_GAME_INVITE_TYPE {
  CHALLENGE = "CHALLENGE",
  INVITE = "INVITE",
}

export enum SOCIAL_GAME_OFFER {
  GAME = "GAME",
  MATCH = "MATCH",
  REMATCH = "REMATCH",
}

export enum SOCIAL_GAME_RELATIONSHIP_TO_INVITEE {
  CONTACT = "CONTACT",
  FRIEND = "FRIEND",
}
