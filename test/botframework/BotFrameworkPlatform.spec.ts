import { AzureBotStorage, AzureTableClient } from "@sheerun/botbuilder-azure";
import { LuisRecognizer } from "botbuilder";
import { expect } from "chai";
import * as _ from "lodash";
import * as simple from "simple-mock";
import { BotFrameworkPlatform } from "../../src/platforms/botframework/BotFrameworkPlatform";
import { VoxaPlatform } from "../../src/platforms/VoxaPlatform";
import { VoxaApp } from "../../src/VoxaApp";
import { variables } from "../variables";
import { views } from "../views";

describe("BotFrameworkPlatform", () => {
  let platform: BotFrameworkPlatform;
  let app: VoxaApp;
  let storage: AzureBotStorage;
  let azureTableClient: AzureTableClient;

  afterEach(() => {
    simple.restore();
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    azureTableClient = new AzureTableClient("", "", "");
    storage = new AzureBotStorage({ gzipData: false }, azureTableClient);

    // we need to mock this before instantiating the platforms cause otherwise
    // we try to get the authorization token

    platform = new BotFrameworkPlatform(app, { recognizer: LuisRecognizer, storage });
    simple.mock(storage, "getData")
      .callbackWith(null, {});

    simple.mock(storage, "saveData")
      .callbackWith(null, {});

    simple.mock(platform, "botApiRequest")
      .resolveWith(true);
  });

  describe("recognize", () => {
    it("should return undefined on empty recognizer response", async () => {
      simple.mock(LuisRecognizer, "recognize").callbackWith(null, undefined, undefined);
      const rawEvent = _.cloneDeep(require("../requests/botframework/StaintIntent.json"));
      const recognizerResponse = await platform.recognize(rawEvent);
      expect(recognizerResponse).to.be.undefined;
    });

    it("should return the highest scoring intent on a recognizer response", async () => {
      const luisResponse = _.cloneDeep(require("../requests/botframework/luis.json"));
      simple.mock(LuisRecognizer, "recognize").callbackWith(null, luisResponse.intents, luisResponse.entities);

      const rawEvent = _.cloneDeep(require("../requests/botframework/StaintIntent.json"));
      const recognizerResponse = await platform.recognize(rawEvent);
      expect(recognizerResponse).to.not.be.undefined;
    });
  });

  describe("lambdaHTTP", () => {
    it("should return CORS and other headers", async () => {
      /* tslint:disable */
      const ALLOWED_HEADERS = "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,x-ms-client-session-id,x-ms-client-request-id,x-ms-effective-locale";
      /* tslint:enable */

      const event = {
        httpMethod: "GET",
      };

      const callback = (err: Error|null, result?: any) => {
        if (err) {
          throw err;
        }

        expect(result.headers["Access-Control-Allow-Headers"]).to.equal(ALLOWED_HEADERS);
      };

      await platform.lambdaHTTP()(event, {}, callback);
    });
  });
});
