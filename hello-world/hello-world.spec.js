const rp = require("request-promise");
const _ = require("lodash");
const { expect } = require("chai");
const { VirtualAlexa } = require("virtual-alexa");
const dockerLambda = require("docker-lambda");
const { getPortPromise } = require("portfinder");
const { spawn } = require("child_process");

const NODE_VERSION = process.env.TRAVIS_NODE_VERSION || "8.10";
const launchIntent = require("../test/requests/alexa/launchRequest.json");
const lambdaProxyLaunchIntent = require("../test/requests/dialogflow/lambdaProxyLaunchIntent.json");
const alexaEvent = require("../test/requests/alexa/launchRequest.json");

/* tslint:disable-next-line:no-var-requires */
const views = require("./views.json");

describe("Hello World", () => {
  describe("Alexa", () => {
    let alexa;

    beforeEach(() => {
      alexa = VirtualAlexa.Builder()
        .handler("hello-world.alexaLambdaHandler") // Lambda function file and name
        .interactionModelFile("./alexa-model.json")
        .create();
    });

    it("Runs the alexa skill and like's voxa", async () => {
      let reply = await alexa.launch();
      expect(reply.response.outputSpeech.ssml).to.include(
        "Welcome to this voxa app, are you enjoying voxa so far?"
      );

      reply = await alexa.utter("yes");
      expect(reply.response.outputSpeech.ssml).to.include(
        views.en.translation.doesLikeVoxa
      );
    });

    it("Runs the alexa skill and does not like voxa", async () => {
      let reply = await alexa.launch();
      expect(reply.response.outputSpeech.ssml).to.include(
        "Welcome to this voxa app, are you enjoying voxa so far?"
      );

      reply = await alexa.utter("no");
      expect(reply.response.outputSpeech.ssml).to.include(
        views.en.translation.doesNotLikeVoxa
      );
    });
  });

  describe("azureFunction", () => {
    let port;
    let child;
    let endpoint;

    beforeEach(async function() {
      this.timeout(10000);
      port = await getPortPromise();
      endpoint = `http://localhost:${port}/api/HelloWorldHttpTrigger`;

      await new Promise((resolve, reject) => {
        child = spawn("npx", ["func", "start", "--port", port]);
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
    });

    it("runs the alexa function through azure functions", async () => {
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
      this.timeout(5000);
      const lambdaCallbackResult = dockerLambda({
        dockerImage: `lambci/lambda:nodejs${NODE_VERSION}`,
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
      this.timeout(5000);
      const lambdaCallbackResult = dockerLambda({
        dockerImage: `lambci/lambda:nodejs${NODE_VERSION}`,
        event: lambdaProxyLaunchIntent,
        handler: "hello-world.dialogFlowActionLambdaHTTPHandler"
      });

      expect(lambdaCallbackResult).to.deep.equal({
        body:
          '{"outputContexts":[{"name":"projects/project/agent/sessions/1525973454075/contexts/attributes","lifespanCount":10000,"parameters":{"attributes":"{\\"model\\":{},\\"state\\":\\"likesVoxa?\\"}"}}],"fulfillmentText":"<speak>Welcome to this voxa app, are you enjoying voxa so far?</speak>","source":"google","payload":{"google":{"expectUserResponse":true,"isSsml":true,"richResponse":{"items":[{"simpleResponse":{"textToSpeech":"<speak>Welcome to this voxa app, are you enjoying voxa so far?</speak>"}}]}}}}',
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        statusCode: 200
      });
    });
  });
});
