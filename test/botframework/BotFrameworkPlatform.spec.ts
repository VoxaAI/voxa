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

import { Callback as AWSLambdaCallback } from "aws-lambda";
import { IMessage, MemoryBotStorage } from "botbuilder";
import { expect } from "chai";
import * as _ from "lodash";
import * as nock from "nock";
import * as simple from "simple-mock";
import { BotFrameworkPlatform, VoxaApp } from "../../src/";
import { getAPIGatewayProxyEvent, getLambdaContext } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

describe("BotFrameworkPlatform", () => {
  let platform: BotFrameworkPlatform;
  let app: VoxaApp;
  let storage: MemoryBotStorage;

  afterEach(() => {
    simple.restore();
    nock.cleanAll();
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    storage = new MemoryBotStorage();

    app.onIntent("LaunchIntent", {
      flow: "terminate",
      sayp: "Hello",
      to: "die",
    });

    async function recognize(msg: IMessage): Promise<undefined> {
      return;
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

        expect(result).to.be.ok;
      };
      const context = getLambdaContext(callback);

      await platform.lambdaHTTP()(event, context, callback);
    });
  });
});
