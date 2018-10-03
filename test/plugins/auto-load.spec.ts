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

"use strict";

import { RequestEnvelope } from "ask-sdk-model";
import { expect } from "chai";
import * as simple from "simple-mock";
import {
  AlexaEvent,
  AlexaPlatform,
  AlexaReply,
  plugins,
  VoxaApp,
} from "../../src";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";
import { AutoLoadAdapter } from "./autoLoadAdapter";

const rb = new AlexaRequestBuilder("user-xyz");

describe("AutoLoad plugin", () => {
  let alexaEvent: RequestEnvelope;
  let adapter: AutoLoadAdapter;

  beforeEach(() => {
    alexaEvent = rb.getIntentRequest("LaunchIntent");

    simple.mock(AutoLoadAdapter.prototype, "get").resolveWith({ Id: 1 });

    adapter = new AutoLoadAdapter();
  });

  afterEach(() => {
    simple.restore();
  });

  it("should get data from adapter", async () => {
    const skill = new VoxaApp({ variables, views });
    plugins.autoLoad(skill, { adapter });

    const spy = simple.spy(() => ({
      ask: "LaunchIntent.OpenResponse",
      to: "die",
    }));

    skill.onIntent("LaunchIntent", spy);
    const alexaSkill = new AlexaPlatform(skill);

    const result = await alexaSkill.execute(alexaEvent);
    expect(spy.lastCall.args[0].intent.name).to.equal("LaunchIntent");
    expect(result.response.outputSpeech.ssml).to.include("Hello! Good");
    expect(result.sessionAttributes.state).to.equal("die");
    expect(result.sessionAttributes.model.user.Id).to.equal(1);
  });

  it("should throw error on getting data from adapter", async () => {
    const skill = new VoxaApp({ variables, views });
    plugins.autoLoad(skill, { adapter });

    const spy = simple.spy(() => ({ ask: "LaunchIntent.OpenResponse" }));
    skill.onIntent("LaunchIntent", spy);

    simple.mock(adapter, "get").rejectWith(new Error("Random error"));

    const platform = new AlexaPlatform(skill);

    const reply = await platform.execute(alexaEvent);
    expect(reply.speech).to.equal(
      "<speak>An unrecoverable error occurred.</speak>",
    );
    // expect(reply.error).to.not.be.undefined;
    // expect(reply.error.message).to.equal('Random error');
  });

  it("should throw an error when no adapter is set up in the config object", () => {
    const skill = new VoxaApp({ variables, views });
    const fn = () => {
      plugins.autoLoad(skill, { adapter: undefined });
    };

    expect(fn).to.throw("Missing adapter");
  });

  it("should not get data from adapter when adapter has an invalid GET function", () => {
    simple.mock(adapter, "get", undefined);

    const skill = new VoxaApp({ variables, views });
    const fn = () => {
      plugins.autoLoad(skill, { adapter });
    };

    expect(fn).to.throw("No get method to fetch data from");
  });
});
