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

import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";
import * as querystring from "querystring";

import {
  AlexaEvent,
  AlexaPlatform,
  AlexaReply,
  EventsBuilder,
  GARBAGE_COLLECTION_DAY,
  GARBAGE_TYPE,
  MEDIA_CONTENT_METHOD,
  MEDIA_CONTENT_TYPE,
  MediaContentEventBuilder,
  MESSAGE_ALERT_FRESHNESS,
  MESSAGE_ALERT_STATUS,
  MESSAGE_ALERT_URGENCY,
  MessageAlertEventBuilder,
  OCCASION_CONFIRMATION_STATUS,
  OCCASION_TYPE,
  OccasionEventBuilder,
  ORDER_STATUS,
  OrderStatusEventBuilder,
  ProactiveEvents,
  SOCIAL_GAME_INVITE_TYPE,
  SOCIAL_GAME_OFFER,
  SOCIAL_GAME_RELATIONSHIP_TO_INVITEE,
  SocialGameInviteEventBuilder,
  SportsEventBuilder,
  TrashCollectionAlertEventBuilder,
  VoxaApp,
  WEATHER_ALERT_TYPE,
  WeatherAlertEventsBuilder,
} from "../../src";
import { AlexaRequestBuilder } from "./../tools";
import { variables } from "./../variables";
import { views } from "./../views";

const rb = new AlexaRequestBuilder();

const clientId: string = "clientId";
const clientSecret: string = "clientSecret";

describe("ProactiveEvents", () => {
  const tokenResponse = {
    access_token: "Atc|MQEWYJxEnP3I1ND03ZzbY_NxQkA7Kn7Aioev_OfMRcyVQ4NxGzJMEaKJ8f0lSOiV-yW270o6fnkI",
    expires_in: 3600,
    scope: "alexa::proactive_events",
    token_type: "Bearer",
  };
  let reqheaders: any = {};

  beforeEach(() => {
    reqheaders = {
      "accept": "application/json",
      "content-length": 105,
      "content-type": "application/x-www-form-urlencoded",
      "host": "api.amazon.com",
    };

    const bodyRequest = {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      scope: "alexa::proactive_events",
    };

    const body = decodeURIComponent(querystring.stringify(bodyRequest));

    nock("https://api.amazon.com", { reqheaders })
      .post("/auth/O2/token", body)
      .reply(200, JSON.stringify(tokenResponse));
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it("should get a new access token and send a WeatherAlert event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 389,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: WeatherAlertEventsBuilder = new WeatherAlertEventsBuilder();
    event
      .setHurricane()
      .setSnowStorm()
      .setThunderStorm()
      .setTornado()
      .addContent("en-US", "source", "CNN")
      .addContent("en-GB", "source", "BBC")
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a SportsEvent event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 604,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: SportsEventBuilder = new SportsEventBuilder();
    event
      .setAwayTeamStatistic("Boston Red Sox", 5)
      .setHomeTeamStatistic("New York Yankees", 2)
      .setUpdate("Boston Red Sox", 5)
      .addContent("en-US", "eventLeagueName", "CNN")
      .addContent("en-GB", "eventLeagueName", "BBC")
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast()
      .setUnicast("userId");

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a MessageAlert event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 366,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: MessageAlertEventBuilder = new MessageAlertEventBuilder();
    event
      .setMessageGroup("Friend", 2, MESSAGE_ALERT_URGENCY.URGENT)
      .setState(MESSAGE_ALERT_STATUS.UNREAD, MESSAGE_ALERT_FRESHNESS.NEW)
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a OrderStatus event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 522,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: OrderStatusEventBuilder = new OrderStatusEventBuilder();
    event
      .setStatus(ORDER_STATUS.ORDER_DELIVERED, "2018-12-19T22:56:24.00Z", "2018-12-19T22:56:24.00Z")
      .addContent("en-US", "sellerName", "CNN")
      .addContent("en-GB", "sellerName", "BBC")
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a Occasion event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 717,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: OccasionEventBuilder = new OccasionEventBuilder();
    event
      .setOccasion("2018-12-19T22:56:24.00Z", OCCASION_TYPE.APPOINTMENT)
      .setStatus(OCCASION_CONFIRMATION_STATUS.CONFIRMED)
      .addContent("en-US", "brokerName", "CNN Chicago")
      .addContent("en-GB", "brokerName", "BBC London")
      .addContent("en-US", "providerName", "CNN")
      .addContent("en-GB", "providerName", "BBC")
      .addContent("en-US", "subject", "Merry Christmas in Chicago")
      .addContent("en-GB", "subject", "Merry Christmas in London")
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a TrashCollectionAlert event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 348,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: TrashCollectionAlertEventBuilder = new TrashCollectionAlertEventBuilder();
    event
      .setAlert(GARBAGE_COLLECTION_DAY.MONDAY,
        GARBAGE_TYPE.BOTTLES,
        GARBAGE_TYPE.BULKY,
        GARBAGE_TYPE.CANS,
        GARBAGE_TYPE.CLOTHING)
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a MediaContent event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 568,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: MediaContentEventBuilder = new MediaContentEventBuilder();
    event
      .setAvailability(MEDIA_CONTENT_METHOD.AIR)
      .setContentType(MEDIA_CONTENT_TYPE.ALBUM)
      .addContent("en-US", "providerName", "CNN")
      .addContent("en-GB", "providerName", "BBC")
      .addContent("en-US", "contentName", "News")
      .addContent("en-GB", "contentName", "Alerts")
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a SocialGameInvite event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 478,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: SocialGameInviteEventBuilder = new SocialGameInviteEventBuilder();
    event
      .setGame(SOCIAL_GAME_OFFER.GAME)
      .setInvite("Test", SOCIAL_GAME_INVITE_TYPE.CHALLENGE, SOCIAL_GAME_RELATIONSHIP_TO_INVITEE.CONTACT)
      .addContent("en-US", "gameName", "CNN")
      .addContent("en-GB", "gameName", "BBC")
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });

  it("should get a new access token and send a general/custom event", async () => {
    reqheaders = {
      "accept": "application/json",
      "authorization": `Bearer ${tokenResponse.access_token}`,
      "content-length": 328,
      "content-type": "application/json",
      "host": "api.amazonalexa.com",
    };

    const userId = "userId";
    const endpoint: string = "https://api.amazonalexa.com";

    const event: EventsBuilder = new EventsBuilder();
    event
      .addContent("en-US", "source", "CNN")
      .addContent("en-GB", "source", "BBC")
      .setName("MyCustomEvent")
      .setPayload({ customProperty: "customValue" })
      .setReferenceId("referenceId1")
      .setTimestamp("2018-12-19T21:56:24.00Z")
      .setExpiryTime("2018-12-19T22:57:24.00Z")
      .setMulticast();

    nock(endpoint, { reqheaders })
      .post("/v1/proactiveEvents/stages/development", event.build())
      .reply(200);

    const proactiveEvents = new ProactiveEvents(clientId, clientSecret);
    const messageResponse = await proactiveEvents.createEvent(endpoint, event, true);

    expect(messageResponse).to.be.undefined;
  });
});
