import "mocha";

import { AzureBotStorage, AzureTableClient } from "@sheerun/botbuilder-azure";
import { LuisRecognizer } from "botbuilder";
import { expect, use } from "chai";
import * as i18n from "i18next";
import * as _ from "lodash";
import * as simple from "simple-mock";
import { BotFrameworkPlatform } from "../../src/platforms/botframework/BotFrameworkPlatform";
import { BotFrameworkReply } from "../../src/platforms/botframework/BotFrameworkReply";
import { VoxaApp } from "../../src/VoxaApp";
import { IVoxaEvent } from "../../src/VoxaEvent";
import { views } from "../views";

describe("BotFramework directives", () => {
  let event: any;
  let app: VoxaApp;
  let botFrameworkSkill: BotFrameworkPlatform;
  let storage: AzureBotStorage; let azureTableClient: AzureTableClient;

  before(() => {
    i18n .init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  afterEach(() => {
    simple.restore();
  });

  beforeEach(() => {
    app = new VoxaApp({ views });
    azureTableClient = new AzureTableClient("", "", "");
    storage = new AzureBotStorage({ gzipData: false }, azureTableClient);
    botFrameworkSkill = new BotFrameworkPlatform(app, {
      storage,
    });
    event = _.cloneDeep(require("../requests/botframework/microsoft.launch.json"));
    simple.mock(storage, "getData")
      .callbackWith(null, {});

    simple.mock(storage, "saveData")
      .callbackWith(null, {});

    simple.mock(BotFrameworkReply.prototype, "getAuthorization")
      .resolveWith({ access_token: "123" });

    simple.mock(BotFrameworkReply.prototype, "botApiRequest")
      .resolveWith({});
  });

  describe("AudioCard", () => {
    it("should render an AudioCard with an url", async () => {
      app.onIntent("LaunchIntent",  {
        botframeworkAudioCard: "http://example.com",
        to: "die",
      });

      await botFrameworkSkill.execute(event, {});
      const mock: any = BotFrameworkReply.prototype.botApiRequest;
      expect(mock.called).to.be.true;
      expect(mock.callCount).to.equal(1);
      const reply = JSON.parse(JSON.stringify(mock.lastCall.args[2]));
      expect(_.omit(reply, "timestamp", "id" )).to.deep.equal({
        attachments: [{
          content: {
            media: [
              {
                profile: "",
                url: "http://example.com",
              },
            ],
          },
          contentType: "application/vnd.microsoft.card.audio",
        }],
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
