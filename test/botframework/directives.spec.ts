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

import "mocha";

import {
  AttachmentLayout,
  AudioCard,
  HeroCard,
  IMessage,
  MemoryBotStorage,
  SuggestedActions,
} from "botbuilder";
import { expect } from "chai";
import * as i18next from "i18next";
import * as _ from "lodash";
import * as nock from "nock";
import * as simple from "simple-mock";
import { BotFrameworkPlatform } from "../../src/platforms/botframework/BotFrameworkPlatform";
import { BotFrameworkReply } from "../../src/platforms/botframework/BotFrameworkReply";
import { VoxaApp } from "../../src/VoxaApp";
import { views } from "../views";

const i18n: i18next.i18n = require("i18next");

describe("BotFramework directives", () => {
  let event: any;
  let app: VoxaApp;
  let botFrameworkSkill: BotFrameworkPlatform;
  let storage: MemoryBotStorage;

  before(async () => {
    await i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  afterEach(() => {
    nock.cleanAll();
    simple.restore();
  });

  beforeEach(() => {
    async function recognize(msg: IMessage): Promise<undefined> {
      return;
    }

    app = new VoxaApp({ views });
    storage = new MemoryBotStorage();
    botFrameworkSkill = new BotFrameworkPlatform(app, {
      defaultLocale: "en",
      recognize,
      storage,
    });
    event = _.cloneDeep(
      require("../requests/botframework/microsoft.launch.json"),
    );
    simple.mock(storage, "getData").callbackWith(null, {});
    simple.mock(storage, "saveData").callbackWith(null, {});
    simple.mock(BotFrameworkReply.prototype, "botApiRequest");
    nock("https://login.microsoftonline.com")
      .persist()
      .post("/botframework.com/oauth2/v2.0/token")
      .reply(200, { access_token: "access_token" });

    nock("https://cortanabfchanneleastus.azurewebsites.net")
      .persist()
      .post(
        "/v3/conversations/38c26473-842e-4dd0-8f40-dc656ab4f2f4/activities/4Cq2PVQFeti",
      )
      .reply(200);
  });

  describe("AudioCard", () => {
    it("should render an AudioCard with a view", async () => {
      app.onIntent("LaunchIntent", {
        botframeworkAudioCard: "BotFrameworkAudioCard",
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        attachments: [
          {
            content: {
              media: [
                {
                  profile: "",
                  url: "http://example.com",
                },
              ],
            },
            contentType: "application/vnd.microsoft.card.audio",
          },
        ],
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "",
        text: "",
        textFormat: "plain",
        type: "message",
      });
    });
  });

  describe("TextP", () => {
    it("should add plain text to the message", async () => {
      app.onIntent("LaunchIntent", {
        sayp: "Some Text",
        textp: "Some Text",
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "<speak>Some Text</speak>",
        text: "Some Text",
        textFormat: "plain",
        type: "message",
      });
    });
  });

  describe("Text", () => {
    it("should add plain text to the message", async () => {
      app.onIntent("LaunchIntent", {
        text: "Say",
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "",
        text: "say",
        textFormat: "plain",
        type: "message",
      });
    });
  });

  describe("Attachments", () => {
    it("should add plain text to the message", async () => {
      const cards = _.map([1, 2, 3], (index: number) => {
        return new HeroCard().title(`Event ${index}`).toAttachment();
      });

      app.onIntent("LaunchIntent", {
        botframeworkAttachmentLayout: AttachmentLayout.carousel,
        botframeworkAttachments: cards,
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        attachmentLayout: "carousel",
        attachments: [
          {
            content: {
              title: "Event 1",
            },
            contentType: "application/vnd.microsoft.card.hero",
          },
          {
            content: {
              title: "Event 2",
            },
            contentType: "application/vnd.microsoft.card.hero",
          },
          {
            content: {
              title: "Event 3",
            },
            contentType: "application/vnd.microsoft.card.hero",
          },
        ],
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "",
        text: "",
        textFormat: "plain",
        type: "message",
      });
    });
  });

  describe("HeroCard", () => {
    it("should add a hero card", async () => {
      const card = new HeroCard()
        .title("Card Title")
        .subtitle("Card Subtitle")
        .text("Some Text");

      app.onIntent("LaunchIntent", {
        botframeworkHeroCard: card,
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        attachments: [
          {
            content: {
              subtitle: "Card Subtitle",
              text: "Some Text",
              title: "Card Title",
            },
            contentType: "application/vnd.microsoft.card.hero",
          },
        ],
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "",
        text: "",
        textFormat: "plain",
        type: "message",
      });
    });
  });

  describe("SignInCard", () => {
    it("should add Sign In Card to the message", async () => {
      app.onIntent("LaunchIntent", {
        botframeworkSigninCard: {
          buttonTitle: "Sign In",
          cardText: "Sign In Card",
          url: "https://example.com",
        },
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        attachments: [
          {
            content: {
              buttons: [
                {
                  title: "Sign In",
                  type: "signin",
                  value: "https://example.com",
                },
              ],
              text: "Sign In Card",
            },
            contentType: "application/vnd.microsoft.card.signin",
          },
        ],
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "",
        text: "",
        textFormat: "plain",
        type: "message",
      });
    });
  });
  describe("Suggested actions", () => {
    it("should add suggested actions to the message", async () => {
      const suggestedActions = new SuggestedActions().addAction({
        title: "Green",
        type: "imBack",
        value: "productId=1&color=green",
      });

      app.onIntent("LaunchIntent", {
        botframeworkSuggestedActions: suggestedActions,
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "",
        suggestedActions: {
          actions: [
            {
              title: "Green",
              type: "imBack",
              value: "productId=1&color=green",
            },
          ],
        },
        text: "",
        textFormat: "plain",
        type: "message",
      });
    });
  });
  describe("Audio Card", () => {
    it("should add an audio card to the message", async () => {
      const audioCard = new AudioCard().title("Sample audio card");
      audioCard.media([
        {
          profile: "audio.mp3",
          url: "http://example.com/audio.mp3",
        },
      ]);

      app.onIntent("LaunchIntent", {
        botframeworkAudioCard: audioCard,
        to: "die",
      });

      await botFrameworkSkill.execute(event);
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id")).to.deep.equal({
        attachments: [
          {
            content: {
              media: [
                {
                  profile: "audio.mp3",
                  url: "http://example.com/audio.mp3",
                },
              ],
              title: "Sample audio card",
            },
            contentType: "application/vnd.microsoft.card.audio",
          },
        ],
        channelId: "cortana",
        conversation: {
          id: "38c26473-842e-4dd0-8f40-dc656ab4f2f4",
        },
        from: {
          id: "tide",
        },
        inputHint: "acceptingInput",
        locale: "en-US",
        recipient: {
          id: "B4418B6C4DFC584B9163EC6491BE1FDFC5F33F85E0B753A13D855AA309B6E722",
        },
        replyToId: "4Cq2PVQFeti",
        speak: "",
        text: "",
        textFormat: "plain",
        type: "message",
      });
    });
  });
});
