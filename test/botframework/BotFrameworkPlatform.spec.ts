import { Callback as AWSLambdaCallback } from "aws-lambda";
import { IMessage, LuisRecognizer } from "botbuilder";
import { AzureBotStorage, AzureTableClient } from "botbuilder-azure";
import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";
import * as simple from "simple-mock";
import { BotFrameworkPlatform } from "../../src/platforms/botframework/BotFrameworkPlatform";
import { VoxaPlatform } from "../../src/platforms/VoxaPlatform";
import { VoxaApp } from "../../src/VoxaApp";
import { getAPIGatewayProxyEvent, getLambdaContext } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

describe("BotFrameworkPlatform", () => {
  let platform: BotFrameworkPlatform;
  let app: VoxaApp;
  let storage: AzureBotStorage;
  let azureTableClient: AzureTableClient;

  afterEach(() => {
    simple.restore();
    nock.cleanAll();
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    azureTableClient = new AzureTableClient("", "", "");
    storage = new AzureBotStorage({ gzipData: false }, azureTableClient);

    async function recognize(msg: IMessage) {
      // return { name: "LanchIntent", params: {}, rawIntent: {} };
    }
    platform = new BotFrameworkPlatform(app, {
      defaultLocale: "en",
      recognize,
      storage,
    });
    simple.mock(storage, "getData").callbackWith(null, {});
    simple.mock(storage, "saveData").callbackWith(null, {});
    nock("https://login.microsoftonline.com")
      .post("/botframework.com/oauth2/v2.0/token")
      .reply(200, {
        access_token: "access_token",
      });

    nock("https://CortanaBFChannelEastUs.azurewebsites.net")
      .post(
        "/v3/conversations/38c26473-842e-4dd0-8f40-dc656ab4f2f4/activities/4Cq2PVQFeti",
      )
      .reply(200);
  });

  describe("lambdaHTTP", () => {
    it("should return CORS and other headers", async () => {
      /* tslint:disable */
      const ALLOWED_HEADERS =
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent,x-ms-client-session-id,x-ms-client-request-id,x-ms-effective-locale";
      /* tslint:enable */

      const event = getAPIGatewayProxyEvent();

      const callback: AWSLambdaCallback = (
        err?: Error | null | string,
        result?: any,
      ) => {
        if (err) {
          throw err;
        }

        expect(result.headers["Access-Control-Allow-Headers"]).to.equal(
          ALLOWED_HEADERS,
        );
      };

      const context = getLambdaContext(callback);

      await platform.lambdaHTTP()(event, context, callback);
    });

    it("should execute the botframework skill", async () => {
      const launchEvent = _.cloneDeep(
        require("../requests/botframework/microsoft.launch.json"),
      );
      const event = getAPIGatewayProxyEvent(
        "POST",
        JSON.stringify(launchEvent),
      );
      const callback: AWSLambdaCallback = (
        err?: Error | null | string,
        result?: any,
      ) => {
        if (err) {
          throw err;
        }

        console.log({ result });
        expect(result).to.be.ok;
      };
      const context = getLambdaContext(callback);

      await platform.lambdaHTTP()(event, context, callback);
    });
  });
});
