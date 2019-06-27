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
import * as _ from "lodash";
import { AlexaPlatform, IVoxaEvent, IVoxaIntentEvent, VoxaApp } from "../src";
import { AlexaRequestBuilder } from "./tools";
import { variables } from "./variables";
import { views } from "./views";

describe("States", () => {
  let voxaApp: VoxaApp;
  let alexaSkill: AlexaPlatform;
  let rb: AlexaRequestBuilder;

  beforeEach(() => {
    rb = new AlexaRequestBuilder();
    voxaApp = new VoxaApp({ variables, views });

    voxaApp.onIntent("HelpIntent", {
      flow: "yield",
      sayp: "Help",
      to: "entry",
    });

    voxaApp.onState(
      "helpSettings",
      (voxaEvent: IVoxaIntentEvent) => {
        if (voxaEvent.intent.name === "AnotherHelpSettingsIntent") {
          return {
            flow: "yield",
            sayp: "user wants help",
            to: "entry",
          };
        }
      },
    );

    voxaApp.onState(
      "helpSettings",
      {
        flow: "yield",
        sayp: "question",
        to: "entry",
      },
      "HelpSettingsIntent",
    );

    voxaApp.onState("undefinedState", () => undefined);

    voxaApp.onUnhandledState(
      (voxaEvent: IVoxaEvent, stateName: string): any => {
        return {
          flow: "terminate",
          sayp: "unhandled",
        };
      },
    );

    alexaSkill = new AlexaPlatform(voxaApp);
  });

  it("should correctly transition to the global handler after failling to find a correct handler", async () => {
    const helpRequest = rb.getIntentRequest("AMAZON.HelpIntent");
    _.set(helpRequest, "session.new", false);
    _.set(helpRequest, "session.attributes", {
      model: {},
      state: "helpSettings",
    });
    const reply = await alexaSkill.execute(helpRequest);
    expect(reply.response.shouldEndSession).to.be.false;
    expect(reply.sessionAttributes).to.deep.equal({
      model: {},
      state: "entry",
    });
    expect(reply.response.outputSpeech.ssml).to.equal("<speak>Help</speak>");
  });

  it("should trigger onUnhandledState when there's no state", async () => {
    const helpRequest = rb.getIntentRequest("AnyIntent");
    _.set(helpRequest, "session.new", false);
    _.set(helpRequest, "session.attributes", {
      model: {},
      state: "helpSettings",
    });
    const reply = await alexaSkill.execute(helpRequest);
    expect(reply.response.shouldEndSession).to.be.true;
    expect(reply.response.outputSpeech.ssml).to.equal(
      "<speak>unhandled</speak>",
    );
  });

  it("should transition to the intent handler with the intent array filter", async () => {
    const helpRequest = rb.getIntentRequest("HelpSettingsIntent");
    _.set(helpRequest, "session.new", false);
    _.set(helpRequest, "session.attributes", {
      model: {},
      state: "helpSettings",
    });
    const reply = await alexaSkill.execute(helpRequest);
    expect(reply.response.outputSpeech.ssml).to.equal(
      "<speak>question</speak>",
    );
  });

  it("should transition to the intent handler without an intent array filter", async () => {
    const helpRequest = rb.getIntentRequest("AnotherHelpSettingsIntent");
    _.set(helpRequest, "session.new", false);
    _.set(helpRequest, "session.attributes", {
      model: {},
      state: "helpSettings",
    });
    const reply = await alexaSkill.execute(helpRequest);
    expect(reply.response.outputSpeech.ssml).to.equal(
      "<speak>user wants help</speak>",
    );
  });

  it("should trigger onUnhandledState when there's no match in the state", async () => {
    const helpRequest = rb.getIntentRequest("AnyIntent");
    _.set(helpRequest, "session.new", false);
    _.set(helpRequest, "session.attributes", {
      model: {},
      state: "undefinedState",
    });
    const reply = await alexaSkill.execute(helpRequest);
    expect(reply.response.shouldEndSession).to.be.true;
    expect(reply.response.outputSpeech.ssml).to.equal(
      "<speak>unhandled</speak>",
    );
  });
});
