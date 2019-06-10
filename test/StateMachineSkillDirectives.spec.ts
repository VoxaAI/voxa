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
import { variables } from "./variables";
import { views } from "./views";

import {
  AlexaEvent,
  AlexaPlatform,
  AlexaReply,
  VoxaApp,
} from "../src";
import { AlexaRequestBuilder } from "./tools";

const rb = new AlexaRequestBuilder();

const TEST_URLS = [
  "https://s3.amazonaws.com/alexa-voice-service/welcome_message.mp3",
  "https://s3.amazonaws.com/alexa-voice-service/bad_response.mp3",
  "https://s3.amazonaws.com/alexa-voice-service/goodbye_response.mp3",
];

const states = {
  CancelIntent: {
    to: "exit",
  },
  LaunchIntent: {
    to: "launch",
  },
  ResumeIntent: {
    to: "resume",
  },
  StopIntent: {
    to: "exit",
  },
  exit: function enter() {
    return { tell: "ExitIntent.Farewell" };
  },
  launch: function enter() {
    return { ask: "LaunchIntent.OpenResponse" };
  },
  resume: function enter(voxaEvent: AlexaEvent) {
    let index = 0;
    let shuffle = 0;
    let loop = 0;
    let offsetInMilliseconds = 0;

    if (voxaEvent.rawEvent.context && voxaEvent.rawEvent.context.AudioPlayer) {
      const token = JSON.parse(
        voxaEvent.rawEvent.context.AudioPlayer.token || "",
      );
      index = token.index;
      shuffle = token.shuffle;
      loop = token.loop;
      offsetInMilliseconds =
        voxaEvent.rawEvent.context.AudioPlayer.offsetInMilliseconds || 0;
    }

    return {
      alexaPlayAudio: {
        behavior: "REPLACE_ALL",
        offsetInMilliseconds,
        token: createToken(index, shuffle, loop),
        url: TEST_URLS[index],
      },
      ask: "LaunchIntent.OpenResponse",
    };
  },
};

function createToken(index: number, shuffle: number, loop: number) {
  return JSON.stringify({ index, shuffle, loop });
}

describe("VoxaApp", () => {
  let app: VoxaApp;
  let skill: AlexaPlatform;

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    skill = new AlexaPlatform(app);
    _.map(states, (state, name) => {
      app.onState(name, state);
    });
  });

  itIs("ResumeIntent", (reply: AlexaReply) => {
    expect(reply.speech).to.include("Hello! Good ");
    expect(_.get(reply, "response.directives[0].type")).to.equal(
      "AudioPlayer.Play",
    );
    expect(_.get(reply, "response.directives[0].playBehavior")).to.equal(
      "REPLACE_ALL",
    );
    expect(
      _.get(
        reply,
        "response.directives[0].audioItem.stream.offsetInMilliseconds",
      ),
    ).to.equal(353160);
  });

  function itIs(intentName: string, cb: any) {
    it(intentName, () => {
      const event = rb.getIntentRequest(intentName);
      event.context.AudioPlayer = {
        offsetInMilliseconds: 353160,
        playerActivity: "STOPPED",
        token: '{"index":1,"shuffle":1,"loop":0}',
      };

      return skill.execute(event).then(cb);
    });
  }
});
