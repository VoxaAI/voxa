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

import {
  APIGatewayProxyEvent,
  Callback as AWSLambdaCallback,
  Context as AWSLambdaContext,
} from "aws-lambda";
import {
  Context as AzureContext,
  HttpMethod as AzureHttpMethod,
} from "azure-functions-ts-essentials";
import { expect } from "chai";
import { LambdaLogOptions } from "lambda-log";
import * as _ from "lodash";
import * as portfinder from "portfinder";
import * as rp from "request-promise";
import {
  AlexaPlatform,
  AlexaReply,
  GoogleAssistantPlatform,
  GoogleAssistantReply,
  VoxaApp,
} from "../src";
import { azureLog } from "../src/azure";
import {
  AlexaRequestBuilder,
  getAPIGatewayProxyEvent,
  getLambdaContext,
} from "./tools";
import { views } from "./views";

const rb = new AlexaRequestBuilder();

describe("VoxaPlatform", () => {
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;
  let dialogflowAction: GoogleAssistantPlatform;

  beforeEach(() => {
    app = new VoxaApp({ views });
    alexaSkill = new AlexaPlatform(app);
    dialogflowAction = new GoogleAssistantPlatform(app);
  });

  describe("startServer", () => {
    it("should call the execute method with an http server", async () => {
      const port = await portfinder.getPortPromise();
      const server = await alexaSkill.startServer(port);

      const options = {
        body: {
          request: "Hello World",
        },
        json: true,
        method: "POST",
        uri: `http://localhost:${port}/`,
      };
      const response = await rp(options);
      expect(response).to.deep.equal({
        response: {
          outputSpeech: {
            ssml: "<speak>An unrecoverable error occurred.</speak>",
            type: "SSML",
          },
          shouldEndSession: true,
        },
        sessionAttributes: {},
        version: "1.0",
      });

      server.close();
    });
  });

  describe("lambda", () => {
    it("should call the execute method with the event and context", async () => {
      const handler = alexaSkill.lambda();
      const event = rb.getSessionEndedRequest("USER_INITIATED");
      let error: any;
      let result: any;
      let counter = 0;

      const callback: AWSLambdaCallback<any> = (
        tmpError?: Error | null | string,
        tmpResult?: any,
      ): void => {
        counter += 1;
        error = tmpError;
        result = tmpResult;
      };

      const context: AWSLambdaContext = getLambdaContext(callback);
      await handler(event, context, callback);
      expect(error).to.be.null;
      expect(result).to.deep.equal({
        response: {},
        sessionAttributes: {},
        version: "1.0",
      });
    });
  });

  describe("lambdaHTTP", () => {
    it("should return a lambda http proxy response object", (done) => {
      const handler = alexaSkill.lambdaHTTP();
      const event = getAPIGatewayProxyEvent(
        "POST",
        JSON.stringify(rb.getSessionEndedRequest()),
      );

      const callback: AWSLambdaCallback<any> = (
        error?: Error | null | string,
        result?: any,
      ) => {
        try {
          expect(error).to.be.null;
          expect(result.statusCode).to.equal(200);
          expect(result.headers["Content-Type"]).to.equal(
            "application/json; charset=utf-8",
          );
          done();
        } catch (error) {
          done(error);
        }
      };
      const context = getLambdaContext(callback);

      handler(event, context, callback);
    });
  });

  describe("azureFunction", () => {
    it("should call the execute method with the event body and return a response in context.res", async () => {
      const handler = alexaSkill.azureFunction();
      const event = {
        body: rb.getSessionEndedRequest(),
        method: AzureHttpMethod.Post,
      };

      const context: AzureContext = {
        bindings: {},
        done: (error?: Error | null, result?: any) => {}, // tslint:disable-line no-empty
        invocationId: "Invocation ID",
        log: azureLog(),
      };

      await handler(context, event);
      expect(context.res).to.be.ok;
    });
  });

  describe("onIntent", () => {
    it("should register onIntent with platform", () => {
      const state = {
        flow: "terminate",
        tell: "Bye",
        to: "die",
      };

      alexaSkill.onIntent("LaunchIntent", state);
    });
  });

  describe("onState", () => {
    let alexaLaunch: any;
    let dialogflowLaunch: any;
    let processData: any;

    afterEach(() => {
      process.env = processData;
    });

    beforeEach(() => {
      processData = _.clone(process.env);
      app.onIntent("LaunchIntent", {
        flow: "continue",
        to: "someState",
      });

      alexaSkill.onState("someState", {
        flow: "yield",
        sayp: "Hello from alexa",
        to: "entry",
      });

      dialogflowAction.onState("someState", {
        flow: "yield",
        sayp: "Hello from dialogflow",
        to: "entry",
      });

      alexaLaunch = rb.getIntentRequest("LaunchIntent");
      /* tslint:disable-next-line:no-var-requires */
      dialogflowLaunch = require("./requests/dialogflow/launchIntent.json");
    });

    it("should enable logging when setting the DEBUG=voxa environment variable", async () => {
      process.env.DEBUG = "voxa";
      let options: LambdaLogOptions = {};
      class Suit extends AlexaPlatform {
        protected getLogOptions(
          executionContext?: AWSLambdaContext | AzureContext,
        ): LambdaLogOptions {
          options = super.getLogOptions(executionContext);

          return options;
        }
      }

      const suit = new Suit(app);
      const reply = await suit.execute(alexaLaunch);
      expect(options.debug).to.be.true;
      expect(options.dev).to.be.true;
    });

    it("should register states as platform specific", async () => {
      const alexaReply = (await alexaSkill.execute(alexaLaunch)) as AlexaReply;
      expect(alexaReply.speech).to.include("Hello from alexa");

      const dialogfloweReply = (await dialogflowAction.execute(
        dialogflowLaunch,
      )) as GoogleAssistantReply;

      expect(dialogfloweReply.speech).to.include("Hello from dialogflow");
    });

    it("should not modify the original transition in the state definition", async () => {
      let reply = (await dialogflowAction.execute(
        dialogflowLaunch,
      )) as GoogleAssistantReply;
      expect(reply.speech).to.equal("<speak>Hello from dialogflow</speak>");

      reply = (await dialogflowAction.execute(
        dialogflowLaunch,
      )) as GoogleAssistantReply;
      expect(reply.speech).to.equal("<speak>Hello from dialogflow</speak>");

      reply = (await dialogflowAction.execute(
        dialogflowLaunch,
      )) as GoogleAssistantReply;
      expect(reply.speech).to.equal("<speak>Hello from dialogflow</speak>");
    });
  });
});
