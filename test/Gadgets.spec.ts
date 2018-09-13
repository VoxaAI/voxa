import { interfaces, services } from "ask-sdk-model";
import { expect, use } from "chai";
import * as _ from "lodash";

import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";
import { AlexaPlatform } from "../src/platforms/alexa/AlexaPlatform";
import { AlexaReply } from "../src/platforms/alexa/AlexaReply";
import {
  GadgetController,
  TRIGGER_EVENT_ENUM,
} from "../src/platforms/alexa/GadgetController";
import {
  ANCHOR_ENUM,
  EVENT_REPORT_ENUM,
  GameEngine,
} from "../src/platforms/alexa/GameEngine";
import { VoxaApp } from "../src/VoxaApp";
import { AlexaRequestBuilder } from "./tools";
import { variables } from "./variables";
import { views } from "./views";

const COLORS = [
  {
    dark: "FFFFFF",
    hex: "F44336",
    name: "red",
  },
  {
    dark: "FFFFFF",
    hex: "F44336",
    name: "blue",
  },
  {
    dark: "FFFFFF",
    hex: "F44336",
    name: "green",
  },
  {
    dark: "FFFFFF",
    hex: "F44336",
    name: "yellow",
  },
];

const actionDown: services.gameEngine.InputEventActionType = "down";
const proxies = _.map(COLORS, "name");
const rollCallPattern: services.gameEngine.Pattern[] = _.map(
  proxies,
  (color) => ({ gadgetIds: [color], action: actionDown }),
);

const rb = new AlexaRequestBuilder();

describe("Gadgets", () => {
  let event: any;
  let app: VoxaApp;
  let alexaSkill: AlexaPlatform;

  beforeEach(() => {
    app = new VoxaApp({ views, variables });
    alexaSkill = new AlexaPlatform(app);
  });

  it("should send GameEngine.StartInputHandler directive", async () => {
    event = rb.getLaunchRequest();

    app.onIntent("LaunchIntent", () => {
      const alexaGameEngineStartInputHandler = rollCall();

      return {
        alexaGameEngineStartInputHandler,
        tell: "Buttons.Discover",
      };
    });

    const reply = await alexaSkill.execute(event, {});

    const responseDirectives = _.get(reply, "response.directives");

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "Press 2 or up to 4 buttons to wake them up.",
    );
    expect(reply.response.reprompt).to.be.undefined;
    expect(responseDirectives[0].events.sample_event).to.be.ok;
    expect(responseDirectives[0].events.timeout).to.be.ok;
    expect(responseDirectives[0].recognizers.sample_event).to.be.ok;
    expect(responseDirectives[0].proxies).to.deep.equal(proxies);
    expect(responseDirectives[0].timeout).to.equal(15000);
    expect(responseDirectives[0].type).to.equal("GameEngine.StartInputHandler");
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.be.undefined;
  });

  it("should recognize 2 buttons, send a SetLight directive and ask to recognize buttons again", async () => {
    event = rb.getGameEngineInputHandlerEventRequest(2);

    app.onIntent("GameEngine.InputHandlerEvent", (voxaEvent) => {
      voxaEvent.model.originatingRequestId =
        voxaEvent.rawEvent.request.originatingRequestId;
      const gameEvents = voxaEvent.rawEvent.request.events[0] || [];
      const inputEvents = _(gameEvents.inputEvents)
        .groupBy("gadgetId")
        .map((value) => value[0])
        .value();

      const directives: interfaces.gadgetController.SetLightDirective[] = [];
      let customId = 0;

      _.forEach(inputEvents, (gadgetEvent) => {
        customId += 1;
        const id = `g${customId}`;

        if (!_.includes(voxaEvent.model.buttons, id)) {
          const buttonIndex = _.size(voxaEvent.model.buttons);
          const targetGadgets = [gadgetEvent.gadgetId];
          let lightDirective: interfaces.gadgetController.SetLightDirective;

          _.set(voxaEvent.model, `buttonIds.${id}`, gadgetEvent.gadgetId);

          voxaEvent.model.buttons = [];
          voxaEvent.model.buttons.push(id);

          const triggerEventTimeMs = 0;
          const gadgetController = new GadgetController();
          const animationBuilder = GadgetController.getAnimationsBuilder();
          const sequenceBuilder = GadgetController.getSequenceBuilder();

          sequenceBuilder
            .duration(1000)
            .blend(false)
            .color(COLORS[buttonIndex].dark);

          animationBuilder
            .repeat(100)
            .targetLights(["1"])
            .sequence([sequenceBuilder]);

          lightDirective = gadgetController
            .setAnimations(animationBuilder)
            .setTriggerEvent(TRIGGER_EVENT_ENUM.NONE)
            .setLight(targetGadgets, triggerEventTimeMs);

          directives.push(lightDirective);

          const otherAnimationBuilder = GadgetController.getAnimationsBuilder();
          const otherSequenceBuilder = GadgetController.getSequenceBuilder();

          otherSequenceBuilder
            .duration(500)
            .blend(false)
            .color(COLORS[buttonIndex].hex);

          otherAnimationBuilder
            .repeat(1)
            .targetLights(["1"])
            .sequence([otherSequenceBuilder.build()]);

          lightDirective = gadgetController
            .setAnimations(otherAnimationBuilder.build())
            .setTriggerEvent(TRIGGER_EVENT_ENUM.BUTTON_DOWN)
            .setLight(targetGadgets, triggerEventTimeMs);

          directives.push(lightDirective);
        }
      });

      const alexaGameEngineStartInputHandler = rollCall(true);

      return {
        alexaGadgetControllerLightDirective: directives,
        alexaGameEngineStartInputHandler,
        tell: "Buttons.Next",
      };
    });

    const reply = await alexaSkill.execute(event, {});
    const responseDirectives = _.get(reply, "response.directives");

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "Guess the next pattern.",
    );
    expect(reply.response.reprompt).to.be.undefined;
    expect(responseDirectives).to.have.lengthOf(5);

    _.forEach(_.initial(responseDirectives), (item) => {
      expect(_.get(item, "type")).to.equal("GadgetController.SetLight");
      expect(_.get(item, "version")).to.equal(1);
      expect(_.get(item, "parameters.triggerEventTimeMs")).to.equal(0);
      expect(_.get(item, "parameters.animations")).to.have.lengthOf(2);
    });

    expect(responseDirectives[4].events.sample_event).to.be.ok;
    expect(responseDirectives[4].events.timeout).to.be.ok;
    expect(responseDirectives[4].recognizers.deviation.type).to.equal(
      "deviation",
    );
    expect(responseDirectives[4].recognizers.deviation.recognizer).to.equal(
      "sample_event",
    );
    expect(responseDirectives[4].recognizers.progress.type).to.equal(
      "progress",
    );
    expect(responseDirectives[4].recognizers.progress.recognizer).to.equal(
      "sample_event",
    );
    expect(responseDirectives[4].recognizers.progress.completion).to.equal(500);
    expect(responseDirectives[4].recognizers.sample_event).to.be.ok;
    expect(responseDirectives[4].proxies).to.deep.equal(proxies);
    expect(responseDirectives[4].timeout).to.equal(15000);
    expect(responseDirectives[4].type).to.equal("GameEngine.StartInputHandler");
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.be.undefined;
  });

  it("should send GameEngine.StopInputHandler directive", async () => {
    event = rb.getIntentRequest("ExitIntent");
    event.session.attributes.originatingRequestId = "originatingRequestId";

    app.onIntent("ExitIntent", (voxaEvent) => {
      const { originatingRequestId } = voxaEvent.model;

      return {
        alexaGameEngineStopInputHandler: originatingRequestId,
        tell: "Buttons.Bye",
      };
    });

    const reply = await alexaSkill.execute(event, {});

    expect(_.get(reply, "response.outputSpeech.ssml")).to.include(
      "Thanks for playing with echo buttons.",
    );
    expect(reply.response.reprompt).to.be.undefined;
    expect(_.get(reply, "response.directives[0].type")).to.equal(
      "GameEngine.StopInputHandler",
    );
    expect(_.get(reply, "sessionAttributes.state")).to.equal("die");
    expect(reply.response.shouldEndSession).to.equal(true);
  });
});

function rollCall(shouldAddOtherBuilders?: boolean) {
  const gameEngineTimeout = 15000;
  const gameEngine = new GameEngine();
  const eventBuilder = GameEngine.getEventsBuilder("sample_event");
  const timeoutEventBuilder = GameEngine.getEventsBuilder("timeout");
  const recognizerBuilder = GameEngine.getPatternRecognizerBuilder(
    "sample_event",
  );

  eventBuilder
    .fails(["fails"])
    .meets(["sample_event"])
    .maximumInvocations(1)
    .reports(EVENT_REPORT_ENUM.MATCHES)
    .shouldEndInputHandler(true)
    .triggerTimeMilliseconds(1000);

  timeoutEventBuilder
    .meets(["timed out"])
    .reports(EVENT_REPORT_ENUM.HISTORY)
    .shouldEndInputHandler(true);

  recognizerBuilder
    .actions("actions")
    .fuzzy(true)
    .gadgetIds(["gadgetIds"])
    .anchor(ANCHOR_ENUM.ANYWHERE)
    .pattern(rollCallPattern);

  if (shouldAddOtherBuilders) {
    const deviationBuilder = GameEngine.getDeviationRecognizerBuilder(
      "deviation",
    );
    const progressBuilder = GameEngine.getProgressRecognizerBuilder("progress");

    deviationBuilder.recognizer("sample_event");
    progressBuilder.completion(500).recognizer("sample_event");

    gameEngine.setRecognizers(deviationBuilder, progressBuilder);
  }

  return gameEngine
    .setEvents(eventBuilder, timeoutEventBuilder.build())
    .setRecognizers(recognizerBuilder.build())
    .startInputHandler(gameEngineTimeout, proxies);
}
