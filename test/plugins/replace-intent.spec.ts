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

import("mocha");

import { expect } from "chai";
import * as simple from "simple-mock";
import { AlexaEvent, AlexaPlatform, AlexaReply, VoxaApp } from "../../src";

import { register as replaceIntent } from "../../src/plugins/replace-intent";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

const rb = new AlexaRequestBuilder();

describe("ReplaceIntentPlugin", () => {
  it("should send to intent with Only", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    const platform = new AlexaPlatform(voxaApp);
    const spy = simple.spy(() => ({ ask: "LaunchIntent.OpenResponse" }));
    voxaApp.onIntent("SomeIntent", spy);

    const event = rb.getIntentRequest("SomeOnlyIntent");

    replaceIntent(voxaApp);
    const reply = (await platform.execute(event)) as AlexaReply;
    expect(spy.called).to.be.true;
    expect(spy.lastCall.args[0].intent.name).to.equal("SomeIntent");
    expect(reply.speech).to.include("Hello! Good ");
  });

  it("shouldn't affect non matching intents", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    const platform = new AlexaPlatform(voxaApp);
    const spy = simple.spy(() => ({ ask: "LaunchIntent.OpenResponse" }));
    voxaApp.onIntent("OnlySomeIntent", spy);

    const event = rb.getIntentRequest("OnlySomeIntent");

    replaceIntent(voxaApp);
    const reply = (await platform.execute(event)) as AlexaReply;
    expect(spy.called).to.be.true;
    expect(spy.lastCall.args[0].intent.name).to.equal("OnlySomeIntent");
    expect(reply.speech).to.include("Hello! Good ");
  });

  it("should use provided regex", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    const platform = new AlexaPlatform(voxaApp);
    const spy = simple.spy(() => ({ ask: "LaunchIntent.OpenResponse" }));
    voxaApp.onIntent("SomeHolderIntent", spy);

    const event = rb.getIntentRequest("SomePlaceholderIntent");

    replaceIntent(voxaApp, {
      regex: /(.*)PlaceholderIntent$/,
      replace: "$1HolderIntent",
    });
    const reply = (await platform.execute(event)) as AlexaReply;
    expect(spy.called).to.be.true;
    expect(spy.lastCall.args[0].intent.name).to.equal("SomeHolderIntent");
    expect(reply.speech).to.include("Hello! Good ");
  });

  it("should use multiple regex", async () => {
    const voxaApp = new VoxaApp({ variables, views });
    const platform = new AlexaPlatform(voxaApp);
    const spy = simple.spy(() => ({ ask: "LaunchIntent.OpenResponse" }));
    voxaApp.onIntent("LongIntent", spy);

    const event = rb.getIntentRequest("VeryLongOnlyIntent");

    replaceIntent(voxaApp, {
      regex: /(.*)OnlyIntent$/,
      replace: "$1Intent",
    });
    replaceIntent(voxaApp, {
      regex: /^VeryLong(.*)/,
      replace: "Long$1",
    });

    const reply = (await platform.execute(event)) as AlexaReply;
    expect(spy.called).to.be.true;
    expect(spy.lastCall.args[0].intent.name).to.equal("LongIntent");
    expect(reply.speech).to.include("Hello! Good ");
  });
});
