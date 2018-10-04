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

import "mocha";

import { expect } from "chai";

import * as _ from "lodash";
import { AlexaPlatform, VoxaApp } from "../../src";
import * as stateFlow from "../../src/plugins/state-flow";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

const rb = new AlexaRequestBuilder();

describe("StateFlow plugin", () => {
  let states: any;
  let event: any;

  beforeEach(() => {
    event = rb.getIntentRequest("SomeIntent");
    event.session = {
      attributes: {
        state: "secondState",
      },
      new: false,
      outputAttributes: {},
    };

    states = {
      entry: { SomeIntent: "intent" },
      fourthState: () => undefined,
      initState: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
      intent: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
      secondState: () => ({ to: "initState" }),
      thirdState: () => Promise.resolve({ to: "die" }),
    };
  });

  it("should store the execution flow in the request", async () => {
    const app = new VoxaApp({ variables, views });
    const skill = new AlexaPlatform(app);
    _.map(states, (state: any, name: string) => {
      app.onState(name, state);
    });
    stateFlow.register(app);

    const result = await skill.execute(event);
    expect(_.get(result, "sessionAttributes.flow")).to.deep.equal([
      "secondState",
      "initState",
      "die",
    ]);
  });

  it("should not crash on null transition", async () => {
    const app = new VoxaApp({ variables, views });
    const skill = new AlexaPlatform(app);
    _.map(states, (state: any, name: string) => {
      app.onState(name, state);
    });

    stateFlow.register(app);
    event.session.attributes.state = "fourthState";

    const result = await skill.execute(event);
    expect(_.get(result, "sessionAttributes.flow")).to.deep.equal([
      "fourthState",
      "intent",
      "die",
    ]);
  });
});
