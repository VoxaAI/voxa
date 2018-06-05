import { expect } from "chai";
import { VirtualAlexa } from "virtual-alexa";

/* tslint:disable-next-line:no-var-requires */
const views = require("./views.json");

describe("Hello World", () => {
  describe("Alexa", () => {
    let alexa: VirtualAlexa;

    beforeEach(() => {
      alexa = VirtualAlexa.Builder()
        .handler("test/hello-world/hello-world.alexaHandler") // Lambda function file and name
        .interactionModelFile("./test/hello-world/alexa-model.json")
        .create();
    });

    it("Runs the alexa skill and like\'s voxa", async () => {
      let reply: any = await alexa.launch();
      expect(reply.response.outputSpeech.ssml).to.include("Welcome to this voxa app, are you enjoying voxa so far?");

      reply = await alexa.utter("yes");
      expect(reply.response.outputSpeech.ssml).to.include(views.en.translation.doesLikeVoxa);
    });

    it("Runs the alexa skill and does not like voxa", async () => {

      let reply: any = await alexa.launch();
      expect(reply.response.outputSpeech.ssml).to.include("Welcome to this voxa app, are you enjoying voxa so far?");

      reply = await alexa.utter("no");
      expect(reply.response.outputSpeech.ssml).to.include(views.en.translation.doesNotLikeVoxa);
    });
  });
});
