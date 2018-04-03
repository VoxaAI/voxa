import { expect } from "chai";
import * as _  from "lodash";
import { Model } from "../../src/Model";
import { DialogFlowEvent } from "../../src/platforms/dialog-flow/DialogFlowEvent";
import { DialogFlowPlatform } from "../../src/platforms/dialog-flow/DialogFlowPlatform";
import { DialogFlowReply } from "../../src/platforms/dialog-flow/DialogFlowReply";
import { VoxaApp } from "../../src/VoxaApp";
import { views } from "../views";

/* tslint:disable-next-line:no-var-requires */
const rawEvent = require("../requests/dialog-flow/launchIntent.json");

describe("DialogFlowReply", () => {
  let reply: DialogFlowReply;

  beforeEach(() => {
    reply = new DialogFlowReply();
  });

  describe("addStatement", () => {
    it("should add to both the speech and richResponse", () => {
      reply.addStatement("THIS IS A TEST");
      expect(reply.speech).to.equal("<speak>THIS IS A TEST</speak>");
      expect(_.get(reply, "data.google.richResponse.items[0]")).to.deep.equal({
        simpleResponse: { ssml: "<speak>THIS IS A TEST</speak>" },
      });
    });
  });

  describe("clear", () => {
    it("should empty the rich response, speech and reprompts", () => {
      reply.addStatement("THIS IS A TEST");
      reply.addReprompt("THIS IS A TEST REPROMPT");
      reply.clear();

      expect(reply.speech).to.equal("");
      expect(_.get(reply, "data.google.richResponse.items")).to.be.empty;
      expect(reply.data.google.noInputPrompts).to.be.empty;
    });
  });

  describe("modelToSessionContext", () => {
    it("should format the model serialization to a dialog flow session context ", async () => {
      const model = new Model({ data: "data" });
      const context = JSON.parse(JSON.stringify(await reply.modelToSessionContext(model)));
      expect(context).to.deep.equal({ name: "model", lifespan: 10000, parameters: { data: "data" } });
    });
  });
});
