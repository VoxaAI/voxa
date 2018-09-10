import("mocha");
import { AzureBotStorage, AzureTableClient } from "botbuilder-azure";
import { expect } from "chai";
import * as _ from "lodash";
import { BotFrameworkEvent } from "../../src/platforms/botframework/BotFrameworkEvent";
import { prepIncomingMessage } from "../../src/platforms/botframework/BotFrameworkPlatform";

const azureTableClient = new AzureTableClient("", "", "");
const storage = new AzureBotStorage({ gzipData: false }, azureTableClient);

describe("BotFrameworkEvent", () => {
  it("should map a webchat conversationUpdate to a LaunchIntent", () => {
    const rawEvent = prepIncomingMessage(
      _.cloneDeep(require("../requests/botframework/conversationUpdate.json")),
    );
    const event = new BotFrameworkEvent(rawEvent, {}, {}, storage);
    expect(event.request.type).to.equal("IntentRequest");
    if (!event.intent) {
      throw new Error("Intent should not be undefined");
    }
    expect(event.intent.name).to.equal("LaunchIntent");
  });

  it("should map a Microsoft.Launch intent to a voxa LaunchIntent", () => {
    const rawEvent = _.cloneDeep(
      require("../requests/botframework/microsoft.launch.json"),
    );
    const event = new BotFrameworkEvent(rawEvent, {}, {}, storage);
    expect(event.request.type).to.equal("IntentRequest");
    if (!event.intent) {
      throw new Error("Intent should not be undefined");
    }
    expect(event.intent.name).to.equal("LaunchIntent");
  });

  it("should give display as a supportedInterface when available", () => {
    const rawEvent = _.cloneDeep(
      require("../requests/botframework/microsoft.launch.json"),
    );
    const event = new BotFrameworkEvent(rawEvent, {}, {}, storage);
    expect(event.supportedInterfaces).to.deep.equal(["Display"]);
  });

  it("should return empty supported interfaces if the entity is not present", () => {
    const rawEvent = _.cloneDeep(
      require("../requests/botframework/StaintIntent.json"),
    );
    const event = new BotFrameworkEvent(rawEvent, {}, {}, storage);
    expect(event.supportedInterfaces).to.deep.equal([]);
  });

  it("should map an endOfConversation request to a voxa SessionEndedRequest", () => {
    const rawEvent = require("../requests/botframework/endOfRequest.json");
    const event = new BotFrameworkEvent(rawEvent, {}, {}, storage);
    expect(event.request.type).to.equal("SessionEndedRequest");
  });

  const utilitiesIntentMapping = {
    "Utilities.Cancel": "CancelIntent",
    "Utilities.Confirm": "YesIntent",
    "Utilities.Help": "HelpIntent",
    "Utilities.Repeat": "RepeatIntent",
    "Utilities.ShowNext": "NextIntent",
    "Utilities.ShowPrevious": "PreviousIntent",
    "Utilities.StartOver": "StartOverIntent",
    "Utilities.Stop": "StopIntent",
  };

  _.map(utilitiesIntentMapping, (to, from) => {
    it(`should map ${from} intento to ${to}`, () => {
      const rawEvent = _.cloneDeep(
        require("../requests/botframework/StaintIntent.json"),
      );
      const intent = {
        name: from,
        params: {},
        rawIntent: {},
      };

      const event = new BotFrameworkEvent(rawEvent, {}, {}, storage, intent);
      if (!event.intent) {
        throw new Error("Intent should not be undefined");
      }
      expect(event.intent.name).to.equal(to);
    });
  });

  it("should correctly map the user", () => {
    const rawEvent = prepIncomingMessage(
      _.cloneDeep(require("../requests/botframework/StaintIntent.json")),
    );
    const event = new BotFrameworkEvent(rawEvent, {}, {}, storage);
    expect(event.user).to.deep.equal({
      id: "LTSO852UtAD",
    });
  });

  it("builds the session", () => {
    const rawEvent = prepIncomingMessage(
      _.cloneDeep(require("../requests/botframework/StaintIntent.json")),
    );
    const event = new BotFrameworkEvent(rawEvent, {}, {}, storage);
    expect(event.session.attributes).to.be.a("object");
    expect(event.session.outputAttributes).to.be.a("object");
  });
});
