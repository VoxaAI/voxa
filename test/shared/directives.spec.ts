import { expect } from "chai";
import * as i18next from "i18next";
import * as _ from "lodash";
import "mocha";
import {
  DialogflowReply,
  GoogleAssistantEvent,
  GoogleAssistantPlatform,
  VoxaApp,
} from "../../src";
import { Entity } from "../../src/platforms/shared";
import { variables } from "./../variables";
import { views } from "./../views";

const i18n: i18next.i18n = require("i18next");

describe("Shared Directives", () => {
  let event: any;
  let app: VoxaApp;
  let dialogflowAgent: GoogleAssistantPlatform;

  before(async () => {
    await i18n.init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    dialogflowAgent = new GoogleAssistantPlatform(app);
    event = _.cloneDeep(require("../requests/dialogflow/launchIntent.json"));
  });

  describe("Entities", () => {
    it("should add a simple entity", async () => {
      app.onIntent("LaunchIntent", {
        entities: "MySessionEntity",
        flow: "yield",
        sayp: "Hello!",
        to: "entry",
      });

      event.originalDetectIntentRequest.payload.surface.capabilities = [];
      console.log("event? ", event);
      const reply = await dialogflowAgent.execute(JSON.stringify(event));
      console.log("reply? ", JSON.stringify(reply));
      expect(reply.sessionEntityTypes).to.deep.equal([
        {
          entities: [
            {
              synonyms: ["apple", "green apple", "crabapple"],
              value: "APPLE_KEY",
            },
            {
              synonyms: ["orange"],
              value: "ORANGE_KEY",
            },
          ],
          entityOverrideMode: "ENTITY_OVERRIDE_MODE_OVERRIDE",
          name:
            "projects/project/agent/sessions/1525973454075/entityTypes/fruit",
        },
      ]);
    });
  });
});
