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

const rp = require("request-promise");
const _ = require("lodash");
const { expect } = require("chai");
const dockerLambda = require("docker-lambda");
const { getPortPromise } = require("portfinder");
const { spawn, execSync } = require("child_process");

const LAMBDA_VERSION = process.env.LAMBDA_VERSION;
const launchIntent = require("../test/requests/alexa/launchRequest.json");
const lambdaProxyLaunchIntent = require("../test/requests/dialogflow/lambdaProxyLaunchIntent.json");

describe("Hello World", () => {
  describe("azureFunction", () => {
    let port;
    let child;
    let endpoint;

    beforeEach(async function() {
      this.timeout(10000);
      port = await getPortPromise();
      endpoint = `http://localhost:${port}/api/HelloWorldHttpTrigger`;

      await new Promise((resolve, reject) => {
        child = spawn("npx", ["func", "start", "--port", port, "--javascript"]);
        child.stdout.on("data", data => {
          if (_.includes(data.toString(), endpoint)) {
            return resolve();
          }
        });
        child.stderr.on("data", data => {
          reject(data.toString());
        });
      });
    });

    afterEach(() => {
      child.kill();
      // super hack cause that child.kill is not really working
      execSync(
        "ps auxw  | grep node | grep func | grep -v mocha | grep -v defunct | awk '{print $2}' | xargs -I% kill %"
      ).toString();
    });

    it("runs the alexa function through azure functions", async function() {
      this.timeout(10000);
      const options = {
        body: launchIntent,
        json: true,
        method: "POST",
        uri: endpoint
      };

      const response = await rp(options);
      expect(response).to.deep.equal({
        response: {
          outputSpeech: {
            ssml:
              "<speak>Welcome to this voxa app, are you enjoying voxa so far?</speak>",
            type: "SSML"
          },
          shouldEndSession: false
        },
        sessionAttributes: {
          model: {},
          state: "likesVoxa?"
        },
        version: "1.0"
      });
    });
  });

  describe("Lambda", () => {
    it("runs the lambda call", function() {
      this.timeout(20000);
      const lambdaCallbackResult = dockerLambda({
        dockerImage: `lambci/lambda:nodejs${LAMBDA_VERSION}`,
        event: launchIntent,
        handler: "hello-world.alexaLambdaHandler"
      });

      expect(lambdaCallbackResult).to.deep.equal({
        version: "1.0",
        response: {
          shouldEndSession: false,
          outputSpeech: {
            ssml:
              "<speak>Welcome to this voxa app, are you enjoying voxa so far?</speak>",
            type: "SSML"
          }
        },
        sessionAttributes: { state: "likesVoxa?", model: {} }
      });
    });

    it("runs the apiGateway call", function() {
      this.timeout(10000);
      const lambdaCallbackResult = dockerLambda({
        dockerImage: `lambci/lambda:nodejs${LAMBDA_VERSION}`,
        event: lambdaProxyLaunchIntent,
        handler: "hello-world.googleAssistantActionLambdaHTTPHandler"
      });

      expect(lambdaCallbackResult.headers).to.deep.equal({
        "Content-Type": "application/json; charset=utf-8"
      });
      expect(lambdaCallbackResult.statusCode).to.equal(200);
      expect(JSON.parse(lambdaCallbackResult.body)).to.deep.equal({
        outputContexts: [
          {
            name:
              "projects/project/agent/sessions/1525973454075/contexts/attributes",
            lifespanCount: 10000,
            parameters: {
              attributes: '{"model":{},"state":"likesVoxa?"}'
            }
          }
        ],
        fulfillmentText:
          "Welcome to this voxa app, are you enjoying voxa so far?",
        source: "google",
        payload: {
          google: {
            expectUserResponse: true,
            userStorage:
              '{"data":{"voxa":{"userId":"ABwppHG14A5zlHSo4Q6CMw3IHD6a3UtYXEtEtcrDrQwBOWKO95VRm-rL-DdhbzDeHXUXiwpDcrDAzY19C8Y"}}}',
            isSsml: true,
            richResponse: {
              items: [
                {
                  simpleResponse: {
                    textToSpeech:
                      "<speak>Welcome to this voxa app, are you enjoying voxa so far?</speak>",
                    displayText:
                      "Welcome to this voxa app, are you enjoying voxa so far?"
                  }
                }
              ]
            }
          }
        }
      });
    });
  });
});
