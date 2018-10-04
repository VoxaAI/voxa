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
import { Server } from "http";
import * as portfinder from "portfinder";
// import { VirtualGoogleAssistant } from "virtual-google-assistant";

/* tslint:disable-next-line:no-var-requires */
const { dialogFlowAction } = require("../../hello-world/hello-world");
/* tslint:disable-next-line:no-var-requires */
const { VirtualGoogleAssistant } = require("virtual-google-assistant");

/* tslint:disable-next-line:no-var-requires */
const views = require("../../hello-world/views.json");

describe("Hello World Google Assistant", () => {
  let googleAssistant: any;
  let server: Server;
  let reply: any;

  beforeEach(async () => {
    const port = await portfinder.getPortPromise();

    server = (await dialogFlowAction.startServer(port)) as Server;

    googleAssistant = VirtualGoogleAssistant.Builder()
      .directory("hello-world/dialogflowmodel")
      .actionUrl(`http://localhost:${port}`)
      .create();
  });

  afterEach((done) => {
    server.close(done);
  });

  it("Runs the dialogFlowAction and like's voxa", async () => {
    googleAssistant.addFilter((request: any) => {
      request.originalDetectIntentRequest.payload.user.userStorage =
        '{"data": {"voxa": {"userId": "123"}}}';
    });

    reply = await googleAssistant.launch();
    expect(reply.fulfillmentText).to.include(
      "Welcome to this voxa app, are you enjoying voxa so far?",
    );

    reply = await googleAssistant.utter("yes");
    expect(reply.fulfillmentText).to.include(views.en.translation.doesLikeVoxa);
  });

  it("Runs the dialogFlowAction and does not like voxa", async () => {
    reply = await googleAssistant.launch();
    expect(reply.fulfillmentText).to.include(
      "Welcome to this voxa app, are you enjoying voxa so far?",
    );

    reply = await googleAssistant.utter("no");
    expect(reply.fulfillmentText).to.include(
      views.en.translation.doesNotLikeVoxa,
    );
  });
});
