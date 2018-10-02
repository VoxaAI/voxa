/**
 * State Machine Skill Tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

"use strict";

const expect = require("chai").expect;
const { VoxaApp, AlexaEvent, AlexaReply, AlexaPlatform } = require("../src/");
const { views } = require("./views");
const variables = require("./variables");
const _ = require("lodash");
const tools = require("./tools");

const rb = new tools.AlexaRequestBuilder();

const states = {
  entry: {
    LaunchIntent: "launch",
    HelpIntent: "help",
    StopIntent: "exit",
    CancelIntent: "exit"
  },
  help: () => ({ ask: "HelpIntent.HelpAboutSkill", to: "die" }),
  exit: () => ({ tell: "ExitIntent.Farewell", to: "die" }),
  launch: () => ({ ask: "LaunchIntent.OpenResponse", to: "die" })
};

describe("StateMachineSkill Help test", () => {
  let app;
  let skill;

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    skill = new AlexaPlatform(app);
    _.map(states, (state, name) => {
      skill.onState(name, state);
    });
  });

  itIs("AMAZON.HelpIntent", reply => {
    expect(reply.speech).to.include("For more help visit");
  });

  function itIs(intentName, cb) {
    it(intentName, () => {
      const event = rb.getIntentRequest(intentName);
      return skill.execute(event).then(cb);
    });
  }
});
