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
import * as i18n from "i18next";
import {
  AlexaCanFullfillReply,
  AlexaEvent,
  AlexaPlatform,
  Hint,
  Renderer,
  Tell,
  VoxaApp,
} from "../../src";
import { AlexaRequestBuilder } from "../tools";
import { variables } from "../variables";
import { views } from "../views";

const rb = new AlexaRequestBuilder();

describe("AlexaCanFullfillReply", () => {
  let reply: AlexaCanFullfillReply;
  let event: AlexaEvent;
  let renderer: Renderer;

  before(() => {
    i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    const app = new VoxaApp({ views });
    const skill = new AlexaPlatform(app);
    renderer = new Renderer({ views, variables });
    event = new AlexaEvent(rb.getIntentRequest("SomeIntent"));
    event.renderer = renderer;
    event.t = i18n.getFixedT(event.request.locale);
    event.platform = skill;
    reply = new AlexaCanFullfillReply();
  });

  it("should generate a correct alexa response for a CanFulfillIntentRequest", () => {
    const canUnderstand = "YES";
    const canFulfill = "YES";
    const voxaEvent = new AlexaEvent(
      rb.getCanFulfillIntentRequestRequest("test intent"),
    );
    reply = new AlexaCanFullfillReply();
    reply.fulfillIntent("YES");
    reply.fulfillSlot("slot1", canUnderstand, canFulfill);

    expect(JSON.parse(JSON.stringify(reply))).to.deep.equal({
      response: {
        canFulfillIntent: {
          canFulfill: "YES",
          slots: {
            slot1: {
              canFulfill: "YES",
              canUnderstand: "YES",
            },
          },
        },
      },
      sessionAttributes: {},
      version: "1.0",
    });
  });
});
