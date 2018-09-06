import { expect } from "chai";
import * as Voxa from "../../src/main";
import { DialogFlowPlatform } from "../../src/platforms/dialogflow/DialogFlowPlatform";
import { DialogFlowReply } from "../../src/platforms/dialogflow/DialogFlowReply";
import { VoxaApp } from "../../src/VoxaApp";
import { views } from "../views";

describe("DialogFlowPlatform", () => {
  describe("execute", () => {
    it("should convert the voxaReply to a Dialog Flow response", async () => {
      const rawEvent = require("../requests/dialogflow/launchIntent.json");
      const voxaApp = new VoxaApp({ views });

      voxaApp.onIntent("LaunchIntent", () => ({
        say: "LaunchIntent.OpenResponse",
      }));

      const platform = new DialogFlowPlatform(voxaApp);

      const reply = (await platform.execute(rawEvent, {})) as DialogFlowReply;
      expect(reply.speech).to.equal("<speak>Hello from DialogFlow</speak>");
    });

    it("should not close the session on Help Intent", async () => {
      const rawEvent = require("../requests/dialogflow/helpIntent.json");
      const voxaApp = new VoxaApp({ views });

      voxaApp.onIntent("HelpIntent", {
        ask: "Help",
        to: "entry",
      });

      const alexaSkill = new Voxa.AlexaPlatform(voxaApp);
      const platform = new Voxa.DialogFlowPlatform(voxaApp);

      const reply = (await platform.execute(rawEvent, {})) as DialogFlowReply;
      expect(reply.speech).to.equal("<speak>This is the help</speak>");
      expect(reply.payload.google.expectUserResponse).to.be.true;
    });
  });
});
