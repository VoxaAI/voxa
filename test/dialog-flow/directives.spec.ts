import { Responses } from "actions-on-google";
import { expect } from "chai";
import * as i18n from "i18next";
import * as _ from "lodash";
import "mocha";

import { DialogFlowPlatform } from "../../src/platforms/dialog-flow/DialogFlowPlatform";
import { VoxaApp } from "../../src/VoxaApp";
import { variables } from "./../variables";
import { views } from "./../views";

describe("DialogFlow Directives", () => {
  let event: any;
  let app: VoxaApp;
  let dialogFlowAgent: DialogFlowPlatform;

  before(() => {
    i18n .init({
      load: "all",
      nonExplicitWhitelist: true,
      resources: views,
    });
  });

  beforeEach(() => {
    app =  new VoxaApp({ views, variables });
    dialogFlowAgent = new DialogFlowPlatform(app);
    event = require("../requests/dialog-flow/launchIntent.json");
  });

  describe("List", () => {
    it("should add a List from a view to the reply", async () => {
      app.onIntent("LaunchIntent", {
        dialogFlowList: "DialogFlowListSelect",
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.data.google.possibleIntents).to.deep.equal({
        inputValueData: {
          "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
          "listSelect": {
            items: [{
              description: "The item description",
              image: {
                accessibilityText: "The image",
                url: "http://example.com/image.jpg",
              },
              title: "The list item",
            }],
            title: "The list select",
          },
        },
        intent: "actions.intent.OPTION",
      });
    });

    it("should add a list from a Responses.List to the reply", async () => {
      const list = new Responses.List()
        .setTitle("The list select");

      const optionItem = new Responses.OptionItem()
        .setTitle("The list item")
        .setDescription("The item description")
        .setImage("http://example.com/image.jpg", "The image");
      list.addItems(optionItem);

      app.onIntent("LaunchIntent", {
        dialogFlowList: list,
        to: "die",
      });

      const reply = await dialogFlowAgent.execute(event, {});
      expect(reply.data.google.possibleIntents).to.deep.equal({
        inputValueData: {
          "@type": "type.googleapis.com/google.actions.v2.OptionValueSpec",
          "listSelect": {
            items: [{
              description: "The item description",
              image: {
                accessibilityText: "The image",
                url: "http://example.com/image.jpg",
              },
              optionInfo: {
                key: "",
                synonyms: [],
              },
              title: "The list item",
            }],
            title: "The list select",
          },
        },
        intent: "actions.intent.OPTION",
      });
    });
  });
});
