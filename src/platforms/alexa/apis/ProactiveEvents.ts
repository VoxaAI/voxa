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

import * as _ from "lodash";
import * as rp from "request-promise";

import { AuthenticationBase } from "./AuthenticationBase";

export class ProactiveEvents extends AuthenticationBase {
  /**
   * Creates proactive event
   * https://developer.amazon.com/docs/smapi/proactive-events-api.html
   */
  public async createEvent(endpoint: string, body: EventsBuilder, isDevelopment?: boolean): Promise<any> {
    const tokenResponse = await this.getAuthenticationToken("alexa::proactive_events");
    let uri = `${endpoint}/v1/proactiveEvents`;

    if (isDevelopment) {
      uri = `${uri}/stages/development`;
    }

    const options = {
      body: body.build(),
      headers: {
        "Authorization": `Bearer ${tokenResponse.access_token}`,
        "Content-Type": "application/json",
      },
      json: true, // Automatically parses the JSON string in the response
      method: "POST",
      uri,
    };

    return Promise.resolve(rp(options));
  }
}

/**
 * Events Builder class reference
 */
export class EventsBuilder {
  private expiryTime: string = "";
  private timestamp: string = "";
  private localizedAttributes: any[] = [];
  private name: string = "";
  private payload: any = {};
  private referenceId: string = "";
  private relevantAudience: any = {};

  public addContent(locale: string, localizedKey: string, localizedValue: string): EventsBuilder {
    this.localizedAttributes = this.localizedAttributes || [];

    let item: any = _.find(this.localizedAttributes, (x) => x.locale === locale);

    if (!item) {
      item = { locale };
      item[localizedKey] = localizedValue;
      this.localizedAttributes.push(item);
    } else {
      item[localizedKey] = localizedValue;
    }

    return this;
  }

  /*
   * expiryTime must be in GMT
   */
  public setExpiryTime(expiryTime: string): EventsBuilder {
    this.expiryTime = expiryTime;

    return this;
  }

  public setName(name: string): EventsBuilder {
    this.name = name;

    return this;
  }

  public setPayload(payload: any): EventsBuilder {
    this.payload = payload;

    return this;
  }

  public setReferenceId(referenceId: string): EventsBuilder {
    this.referenceId = referenceId;

    return this;
  }

  public setMulticast(): EventsBuilder {
    this.relevantAudience = {
      payload: {},
      type: "Multicast",
    };

    return this;
  }

  /*
   * timestamp must be in GMT
   */
  public setTimestamp(timestamp: string): EventsBuilder {
    this.timestamp = timestamp;

    return this;
  }

  public setUnicast(userId: string): EventsBuilder {
    this.relevantAudience = {
      payload: { user: userId },
      type: "Unicast",
    };

    return this;
  }

  public build(): any {
    return {
      event: {
        name: this.name,
        payload: this.payload,
      },
      expiryTime: this.expiryTime,
      localizedAttributes: this.localizedAttributes,
      referenceId: this.referenceId,
      relevantAudience: this.relevantAudience,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Weather Alert Events Builder class reference
 */
export class WeatherAlertEventsBuilder extends EventsBuilder {
  public setHurricane(): WeatherAlertEventsBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.HURRICANE);

    return this;
  }

  public setSnowStorm(): WeatherAlertEventsBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.SNOW_STORM);

    return this;
  }

  public setThunderStorm(): WeatherAlertEventsBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.THUNDER_STORM);

    return this;
  }

  public setTornado(): WeatherAlertEventsBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.TORNADO);

    return this;
  }

  private setAlertType(alertType: WEATHER_ALERT_TYPE): WeatherAlertEventsBuilder {
    const payload = {
      weatherAlert: {
        alertType,
        source: "localizedattribute:source",
      },
    };

    this.setName("AMAZON.WeatherAlert.Activated");
    this.setPayload(payload);

    return this;
  }
}

export enum WEATHER_ALERT_TYPE {
  HURRICANE = "HURRICANE",
  SNOW_STORM = "SNOW_STORM",
  THUNDER_STORM = "THUNDER_STORM",
  TORNADO = "TORNADO",
}

/**
 * Sports Events Builder class reference
 */
export class SportsEventBuilder extends EventsBuilder {
  public sportsEvent: any = {};
  public update: any = {};

  public setAwayTeamStatistic(teamName: string, score: number): SportsEventBuilder {
    this.sportsEvent.awayTeamStatistic = {
      score,
      team: { name: teamName },
    };

    return this;
  }

  public setHomeTeamStatistic(teamName: string, score: number): SportsEventBuilder {
    this.sportsEvent.homeTeamStatistic = {
      score,
      team: { name: teamName },
    };

    return this;
  }

  public setUpdate(teamName: string, scoreEarned: number): SportsEventBuilder {
    this.update = { scoreEarned, teamName };

    return this;
  }

  public build(): SportsEventBuilder {
    this.sportsEvent.eventLeague = {
      name: "localizedattribute:eventLeagueName",
    };

    const payload = {
      sportsEvent: this.sportsEvent,
      update: this.update,
    };

    this.setName("AMAZON.SportsEvent.Updated");
    this.setPayload(payload);

    return super.build();
  }
}

/**
 * Message Alert Events Builder class reference
 */
export class MessageAlertEventBuilder extends EventsBuilder {
  public messageGroup: any = {};
  public state: any = {};

  public setMessageGroup(
    creatorName: string,
    count: number,
    urgency?: MESSAGE_ALERT_URGENCY): MessageAlertEventBuilder {
    this.messageGroup = {
      count,
      creator: { name: creatorName },
      urgency,
    };

    return this;
  }

  public setState(status: MESSAGE_ALERT_STATUS, freshness?: MESSAGE_ALERT_FRESHNESS): MessageAlertEventBuilder {
    this.state = { status, freshness };
    return this;
  }

  public build(): MessageAlertEventBuilder {
    const payload = {
      messageGroup: this.messageGroup,
      state: this.state,
    };

    this.setName("AMAZON.MessageAlert.Activated");
    this.setPayload(payload);

    return super.build();
  }
}

export enum MESSAGE_ALERT_FRESHNESS {
  NEW = "NEW",
  OVERDUE = "OVERDUE",
}

export enum MESSAGE_ALERT_STATUS {
  FLAGGED = "FLAGGED",
  UNREAD = "UNREAD",
}

export enum MESSAGE_ALERT_URGENCY {
  URGENT = "URGENT",
}

/**
 * Order Status Events Builder class reference
 */
export class OrderStatusEventBuilder extends EventsBuilder {
  public state: any = {};

  public setStatus(status: ORDER_STATUS, expectedArrival?: string, enterTimestamp?: string): OrderStatusEventBuilder {
    this.state = { status, enterTimestamp };

    if (expectedArrival) {
      this.state.deliveryDetails = { expectedArrival };
    }

    return this;
  }

  public build(): OrderStatusEventBuilder {
    const payload = {
      order: {
        seller: {
          name: "localizedattribute:sellerName",
        },
      },
      state: this.state,
    };

    this.setName("AMAZON.OrderStatus.Updated");
    this.setPayload(payload);

    return super.build();
  }
}

export enum ORDER_STATUS {
  ORDER_DELIVERED = "ORDER_DELIVERED",
  ORDER_OUT_FOR_DELIVERY = "ORDER_OUT_FOR_DELIVERY",
  ORDER_PREPARING = "ORDER_PREPARING",
  ORDER_RECEIVED = "ORDER_RECEIVED",
  ORDER_SHIPPED = "ORDER_SHIPPED",
  PREORDER_RECEIVED = "PREORDER_RECEIVED",
}

/**
 * Occasion Events Builder class reference
 */
export class OccasionEventBuilder extends EventsBuilder {
  public occasion: any = {};
  public state: any = {};

  public setOccasion(bookingTime: string, occasionType: OCCASION_TYPE): OccasionEventBuilder {
    this.occasion = {
      bookingTime,
      broker: {
        name: "localizedattribute:brokerName",
      },
      occasionType,
      provider: {
        name: "localizedattribute:providerName",
      },
      subject: "localizedattribute:subject",
    };

    return this;
  }

  public setStatus(confirmationStatus: OCCASION_CONFIRMATION_STATUS): OccasionEventBuilder {
    this.state = { confirmationStatus };

    return this;
  }

  public build(): OccasionEventBuilder {
    const payload = {
      occasion: this.occasion,
      state: this.state,
    };

    this.setName("AMAZON.Occasion.Updated");
    this.setPayload(payload);

    return super.build();
  }
}

export enum OCCASION_CONFIRMATION_STATUS {
  CANCELED = "CANCELED",
  CONFIRMED = "CONFIRMED",
  CREATED = "CREATED",
  REQUESTED = "REQUESTED",
  RESCHEDULED = "RESCHEDULED",
  UPDATED = "UPDATED",
}

export enum OCCASION_TYPE {
  APPOINTMENT = "APPOINTMENT",
  APPOINTMENT_REQUEST = "APPOINTMENT_REQUEST",
  RESERVATION = "RESERVATION",
  RESERVATION_REQUEST = "RESERVATION_REQUEST",
}

/**
 * Trash Collection Alert Events Builder class reference
 */
export class TrashCollectionAlertEventBuilder extends EventsBuilder {
  public alert: any = {};

  public setAlert(
    collectionDayOfWeek: GARBAGE_COLLECTION_DAY,
    ...garbageTypes: GARBAGE_TYPE[]): TrashCollectionAlertEventBuilder {
    this.alert = {
      collectionDayOfWeek,
      garbageTypes,
    };

    return this;
  }

  public build(): TrashCollectionAlertEventBuilder {
    const payload = {
      alert: this.alert,
    };

    this.setName("AMAZON.TrashCollectionAlert.Activated");
    this.setPayload(payload);

    return super.build();
  }
}

export enum GARBAGE_COLLECTION_DAY {
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  SATURDAY = "SATURDAY",
  SUNDAY = "SUNDAY",
}

export enum GARBAGE_TYPE {
  BOTTLES = "BOTTLES",
  BULKY = "BULKY",
  BURNABLE = "BURNABLE",
  CANS = "CANS",
  CLOTHING = "CLOTHING",
  COMPOSTABLE = "COMPOSTABLE",
  CRUSHABLE = "CRUSHABLE",
  GARDEN_WASTE = "GARDEN_WASTE",
  GLASS = "GLASS",
  HAZARDOUS = "HAZARDOUS",
  HOME_APPLIANCES = "HOME_APPLIANCES",
  KITCHEN_WASTE = "KITCHEN_WASTE",
  LANDFILL = "LANDFILL",
  PET_BOTTLES = "PET_BOTTLES",
  RECYCLABLE_PLASTICS = "RECYCLABLE_PLASTICS",
  WASTE_PAPER = "WASTE_PAPER",
}

/**
 * Media Content Events Builder class reference
 */
export class MediaContentEventBuilder extends EventsBuilder {
  public availability: any = {};
  public content: any = {};

  public setAvailability(method: MEDIA_CONTENT_METHOD): MediaContentEventBuilder {
    this.availability = {
      method,
      provider: {
        name: "localizedattribute:providerName",
      },
      startTime: new Date().toISOString(),
    };

    return this;
  }

  public setContentType(contentType: MEDIA_CONTENT_TYPE): MediaContentEventBuilder {
    this.content = {
      contentType,
      name: "localizedattribute:contentName",
    };

    return this;
  }

  public build(): MediaContentEventBuilder {
    const payload = {
      availability: this.availability,
      content: this.content,
    };

    this.setName("AMAZON.MediaContent.Available");
    this.setPayload(payload);

    return super.build();
  }
}

export enum MEDIA_CONTENT_METHOD {
  AIR = "AIR",
  DROP = "DROP",
  PREMIERE = "PREMIERE",
  RELEASE = "RELEASE",
  STREAM = "STREAM",
}

export enum MEDIA_CONTENT_TYPE {
  ALBUM = "ALBUM",
  BOOK = "BOOK",
  EPISODE = "EPISODE",
  GAME = "GAME",
  MOVIE = "MOVIE",
  SINGLE = "SINGLE",
}

/**
 * Social Game Invite Events Builder class reference
 */
export class SocialGameInviteEventBuilder extends EventsBuilder {
  public game: any = {};
  public invite: any = {};

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

  public build(): SocialGameInviteEventBuilder {
    const payload = {
      game: this.game,
      invite: this.invite,
    };

    this.setName("AMAZON.SocialGameInvite.Available");
    this.setPayload(payload);

    return super.build();
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
