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
import { S3 } from "aws-sdk";
import { expect } from "chai";
import * as simple from "simple-mock";
import { AlexaPlatform, IS3Persistence, plugins, VoxaApp, VoxaEvent } from "../../src";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

const rb = new AlexaRequestBuilder("user-xyz");

describe("S3Persistence plugin", () => {
  let alexaEvent: RequestEnvelope;
  let s3PersistenceConfig: IS3Persistence = {
    bucketName: "",
  };

  beforeEach(() => {
    alexaEvent = rb.getIntentRequest("LaunchIntent");

    simple.mock(S3.prototype, "getObject").returnWith({
      promise: () => {
        const result = { Body: "{ \"userId\": \"12345\", \"name\": \"John Doe\" }" };
        return Promise.resolve(result);
      },
    });
    simple.mock(S3.prototype, "putObject").returnWith({
      promise: () => {
        return Promise.resolve({});
      },
    });

    s3PersistenceConfig = {
      bucketName: "bucketName",
    };
  });

  afterEach(() => {
    simple.restore();
  });

  it("should get data from adapter", async () => {
    const skill = new VoxaApp({ variables, views });
    plugins.s3Persistence(skill, s3PersistenceConfig);

    const spy = simple.spy((voxaEvent: VoxaEvent) => {
      voxaEvent.model.user.openingCount = 1;

      return {
        ask: "LaunchIntent.OpenResponse",
        to: "die",
      };
    });

    skill.onIntent("LaunchIntent", spy);
    const alexaSkill = new AlexaPlatform(skill);

    const result = await alexaSkill.execute(alexaEvent);

    expect(spy.lastCall.args[0].intent.name).to.equal("LaunchIntent");
    expect(result.response.outputSpeech.ssml).to.include("Hello! Good");
    expect(result.sessionAttributes.state).to.equal("die");
    expect(result.sessionAttributes.model.user.openingCount).to.equal(1);
    expect(result.sessionAttributes.model.user.name).to.equal("John Doe");
    expect(result.sessionAttributes.model.user.userId).to.equal("12345");
  });

  it("should throw error on getting data from adapter", async () => {
    const skill = new VoxaApp({ variables, views });
    plugins.s3Persistence(skill, s3PersistenceConfig);

    const spy = simple.spy(() => ({ ask: "LaunchIntent.OpenResponse" }));
    skill.onIntent("LaunchIntent", spy);

    simple.mock(S3.prototype, "getObject").throwWith(new Error("Random error"));

    const platform = new AlexaPlatform(skill);

    const reply = await platform.execute(alexaEvent);
    expect(reply.speech).to.equal(
      "<speak>An unrecoverable error occurred.</speak>",
    );
    // expect(reply.error).to.not.be.undefined;
    // expect(reply.error.message).to.equal('Random error');
  });

  it("should throw an error when no bucketName is set up in the config object", () => {
    const skill = new VoxaApp({ variables, views });
    const fn = () => {
      plugins.s3Persistence(skill, { bucketName: undefined });
    };

    expect(fn).to.throw("Missing bucketName");
  });
});
