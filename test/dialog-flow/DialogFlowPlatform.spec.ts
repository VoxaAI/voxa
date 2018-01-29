import { expect } from "chai";
import { DialogFlowPlatform } from "../../src/platforms/dialog-flow/DialogFlowPlatform";
import { DialogFlowReply } from "../../src/platforms/dialog-flow/DialogFlowReply";
import { VoxaApp } from "../../src/VoxaApp";
import { IVoxaReply } from "../../src/VoxaReply";
import { views } from "../views";

xdescribe("DialogFlowPlatform", () => {
  describe("execute", () => {
    it("should convert the voxaReply to a Dialog Flow response", async () => {
      const rawEvent = require("../requests/dialog-flow/launchIntent.json");
      const voxaApp = new VoxaApp({ views });

      voxaApp.onIntent("LaunchIntent", () => ({ reply: "LaunchIntent.OpenResponse" }));

      const platform = new DialogFlowPlatform(voxaApp);

      const reply = await platform.execute(rawEvent, {}) as DialogFlowReply;
      expect(reply.speech).to.equal("<speak>Hello from DialogFlow</speak>");
    });
  });
});
