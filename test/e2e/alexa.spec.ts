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

import { expect } from "chai";
import { SkillResponse, VirtualAlexa } from "virtual-alexa";

/* tslint:disable-next-line:no-var-requires */
const views = require("../../hello-world/views.json");

describe("Hello World Alexa", () => {
  let alexa: VirtualAlexa;

  beforeEach(() => {
    alexa = VirtualAlexa.Builder()
      .handler("hello-world/hello-world.alexaLambdaHandler") // Lambda function file and name
      .interactionModelFile("hello-world/alexa-model.json")
      .create();
  });

  it("Runs the alexa skill and like's voxa", async () => {
    let reply = await alexa.launch();
    expect(reply.response.outputSpeech.ssml).to.include(
      "Welcome to this voxa app, are you enjoying voxa so far?",
    );

    reply = (await alexa.utter("yes")) as SkillResponse;
    expect(reply.response.outputSpeech.ssml).to.include(
      views.en.translation.doesLikeVoxa,
    );
  });

  it("Runs the alexa skill and does not like voxa", async () => {
    let reply = await alexa.launch();
    expect(reply.response.outputSpeech.ssml).to.include(
      "Welcome to this voxa app, are you enjoying voxa so far?",
    );

    reply = (await alexa.utter("no")) as SkillResponse;
    expect(reply.response.outputSpeech.ssml).to.include(
      views.en.translation.doesNotLikeVoxa,
    );
  });
});
