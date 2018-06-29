const { expect } = require("chai");
const { VirtualAlexa } = require("virtual-alexa");
const dockerLambda = require('docker-lambda');

const NODE_VERSION = process.env.TRAVIS_NODE_VERSION || "8.10"
const launchIntent = require('../test/requests/alexa/launchRequest.json')

/* tslint:disable-next-line:no-var-requires */
const views = require("./views.json");

describe("Hello World", () => {
  describe("Alexa", () => {
    let alexa;

    beforeEach(() => {
      alexa = VirtualAlexa.Builder()
        .handler("hello-world.alexaHandler") // Lambda function file and name
        .interactionModelFile("./alexa-model.json")
        .create();
    });

    it("Runs the alexa skill and like\'s voxa", async () => {
      let reply = await alexa.launch();
      expect(reply.response.outputSpeech.ssml).to.include("Welcome to this voxa app, are you enjoying voxa so far?");

      reply = await alexa.utter("yes");
      expect(reply.response.outputSpeech.ssml).to.include(views.en.translation.doesLikeVoxa);
    });

    it("Runs the alexa skill and does not like voxa", async () => {

      let reply = await alexa.launch();
      expect(reply.response.outputSpeech.ssml).to.include("Welcome to this voxa app, are you enjoying voxa so far?");

      reply = await alexa.utter("no");
      expect(reply.response.outputSpeech.ssml).to.include(views.en.translation.doesNotLikeVoxa);
    });
  });
});


describe('Lambda', () => {
  it("runs the lambda call", () => {
    const lambdaCallbackResult = dockerLambda({
      dockerImage: `lambci/lambda:nodejs${NODE_VERSION}`,
      event: launchIntent,
      handler: 'hello-world.alexaHandler',
    });

    expect(lambdaCallbackResult).to.deep.equal( {
      version: '1.0',
      response:
      { shouldEndSession: false,
        outputSpeech:
        { ssml: '<speak>Welcome to this voxa app, are you enjoying voxa so far?</speak>',
          type: 'SSML' } },
      sessionAttributes: { state: 'likesVoxa?' }
    });

  });
});
