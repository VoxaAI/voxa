'use strict';

const _ = require('lodash');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

const StateMachineSkill = require('../lib/StateMachineSkill.js');
const views = require('./views');
const variables = require('./variables');

chai.use(chaiAsPromised);
const expect = chai.expect;

const COLORS = [
  {
    name: 'red',
    dark: 'FFFFFF',
  },
  {
    name: 'blue',
    dark: 'FFFFFF',
  },
  {
    name: 'green',
    dark: 'FFFFFF',
  },
  {
    name: 'yellow',
    dark: 'FFFFFF',
  },
];
const proxies = _.map(COLORS, 'name');
const rollCallPattern = _.map(proxies, color => ({ gadgetIds: [color], action: 'down' }));

describe('StateMachineSkill', () => {
  it('should send GameEngine.StartInputHandler directive', () => {
    const event = {
      request: {
        type: 'LaunchRequest',
      },
      session: {
        new: true,
        application: {
          applicationId: 'appId',
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('LaunchIntent', (voxaEvent) => {
      const directives = [rollCall(voxaEvent)];

      return { reply: 'Buttons', directives };
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Press 2 or up to 4 buttons to wake them up.');
        expect(reply.msg.reprompt).to.equal('');
        expect(reply.msg.directives[0].events.sample_event).to.be.ok;
        expect(reply.msg.directives[0].events.timeout).to.be.ok;
        expect(reply.msg.directives[0].recognizers.sample_event).to.be.ok;
        expect(reply.msg.directives[0].proxies).to.deep.equal(proxies);
        expect(reply.msg.directives[0].timeout).to.equal(15000);
        expect(reply.msg.directives[0].type).to.equal('GameEngine.StartInputHandler');
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.be.undefined;
      });
  });

  it('should recognize 2 buttons, send a GadgetController.SetLight directive and ask to recognize buttons again', () => {
    const event = {
      request: {
        type: 'GameEngine.InputHandlerEvent',
        originatingRequestId: 'amzn1.echo-api.request.406fbc75-8bf8-4077-a73d-519f53d172d6',
        events: [
          {
            name: 'sample_event',
            inputEvents: [
              {
                gadgetId: 'id1',
                timestamp: 'timestamp',
                color: '000000',
                feature: 'press',
                action: 'down',
              },
              {
                gadgetId: 'id2',
                timestamp: 'timestamp',
                color: '000000',
                feature: 'press',
                action: 'down',
              },
            ],
          },
        ],
      },
      session: {
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('GameEngineInputHandlerEvent', (voxaEvent) => {
      voxaEvent.model.originatingRequestId = voxaEvent.request.originatingRequestId;
      const gameEvents = voxaEvent.request.events[0] || [];
      const inputEvents = _(gameEvents.inputEvents)
        .groupBy('gadgetId')
        .map(value => value[0])
        .value();

      const directives = [];
      let customId = 0;

      _.forEach(inputEvents, (gadgetEvent) => {
        customId += 1;
        const id = `g${customId}`;

        if (!_.includes(voxaEvent.model.buttons, id)) {
          const buttonIndex = _.size(voxaEvent.model.buttons);
          const targetGadgets = [gadgetEvent.gadgetId];

          _.set(voxaEvent.model, `buttonIds.${id}`, gadgetEvent.gadgetId);

          voxaEvent.model.buttons = [];
          voxaEvent.model.buttons.push(id);

          const triggerEventTimeMs = 0;
          const GadgetController = voxaEvent.gadgetController;
          const gadgetController = new GadgetController();
          const animationBuilder = GadgetController.getAnimationsBuilder();
          const sequenceBuilder = GadgetController.getSequenceBuilder();

          sequenceBuilder
            .duration(1000)
            .blend(false)
            .color(COLORS[buttonIndex].dark);

          animationBuilder
            .repeat(100)
            .targetLights(['1'])
            .sequence([sequenceBuilder]);

          directives.push(gadgetController
            .setAnimations(animationBuilder)
            .setTriggerEvent(GadgetController.TRIGGER_EVENT_ENUM.NONE)
            .setLight(targetGadgets, triggerEventTimeMs));


          const otherAnimationBuilder = GadgetController.getAnimationsBuilder();
          const otherSequenceBuilder = GadgetController.getSequenceBuilder();

          otherSequenceBuilder
            .duration(500)
            .blend(false)
            .color(COLORS[buttonIndex].hex);

          otherAnimationBuilder
            .repeat(1)
            .targetLights(['1'])
            .sequence([otherSequenceBuilder.build()]);

          directives.push(gadgetController
            .setAnimations(otherAnimationBuilder.build())
            .setTriggerEvent(GadgetController.TRIGGER_EVENT_ENUM.BUTTON_DOWN)
            .setLight(targetGadgets, triggerEventTimeMs));
        }
      });

      directives.push(rollCall(voxaEvent, true));

      return { reply: 'ButtonsNext', directives };
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Guess the next pattern.');
        expect(reply.msg.reprompt).to.equal('');
        expect(reply.msg.directives).to.have.lengthOf(5);

        _.forEach(_.initial(reply.msg.directives), (item) => {
          expect(item.type).to.equal('GadgetController.SetLight');
          expect(item.version).to.equal(1);
          expect(item.parameters.triggerEventTimeMs).to.equal(0);
          expect(item.parameters.animations).to.have.lengthOf(3);
        });

        expect(reply.msg.directives[4].events.sample_event).to.be.ok;
        expect(reply.msg.directives[4].events.timeout).to.be.ok;
        expect(reply.msg.directives[4].recognizers.deviation.type).to.equal('deviation');
        expect(reply.msg.directives[4].recognizers.deviation.recognizer).to.equal('sample_event');
        expect(reply.msg.directives[4].recognizers.progress.type).to.equal('progress');
        expect(reply.msg.directives[4].recognizers.progress.recognizer).to.equal('sample_event');
        expect(reply.msg.directives[4].recognizers.progress.completion).to.equal(500);
        expect(reply.msg.directives[4].recognizers.sample_event).to.be.ok;
        expect(reply.msg.directives[4].proxies).to.deep.equal(proxies);
        expect(reply.msg.directives[4].timeout).to.equal(15000);
        expect(reply.msg.directives[4].type).to.equal('GameEngine.StartInputHandler');
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.be.undefined;
      });
  });

  it('should send GameEngine.StopInputHandler directive', () => {
    const event = {
      request: {
        type: 'IntentRequest',
        intent: {
          name: 'ExitIntent',
        },
      },
      session: {
        attributes: {
          originatingRequestId: 'originatingRequestId',
        },
        new: false,
        application: {
          applicationId: 'appId',
        },
      },
    };

    const stateMachineSkill = new StateMachineSkill({ variables, views });
    stateMachineSkill.onIntent('ExitIntent', (voxaEvent) => {
      const GameEngine = voxaEvent.gameEngine;
      const directives = [GameEngine.stopInputHandler(voxaEvent.model.originatingRequestId)];

      return { reply: 'ButtonsBye', directives };
    });

    return stateMachineSkill.execute(event)
      .then((reply) => {
        expect(reply.msg.statements[0]).to.equal('Thanks for playing with echo buttons.');
        expect(reply.msg.reprompt).to.equal('');
        expect(reply.msg.directives[0].type).to.equal('GameEngine.StopInputHandler');
        expect(reply.session.attributes.originatingRequestId).to.equal('originatingRequestId');
        expect(reply.session.attributes.state).to.equal('die');
        expect(reply.toJSON().response.shouldEndSession).to.equal(true);
      });
  });
});

function rollCall(voxaEvent, shouldAddOtherBuilders) {
  const gameEngineTimeout = 15000;
  const GameEngine = voxaEvent.gameEngine;
  const gameEngine = new GameEngine();
  const eventBuilder = GameEngine.getEventsBuilder('sample_event');
  const timeoutEventBuilder = GameEngine.getEventsBuilder('timeout');
  const recognizerBuilder = GameEngine.getPatternRecognizerBuilder('sample_event');

  eventBuilder
    .fails(['fails'])
    .meets(['sample_event'])
    .maximumInvocations(1)
    .reports(GameEngine.EVENT_REPORT_ENUM.MATCHES)
    .shouldEndInputHandler(true)
    .triggerTimeMilliseconds(1000);

  timeoutEventBuilder
    .meets(['timed out'])
    .reports(GameEngine.EVENT_REPORT_ENUM.HISTORY)
    .shouldEndInputHandler(true);

  recognizerBuilder
    .actions('actions')
    .fuzzy(true)
    .gadgetIds(['gadgetIds'])
    .anchor(GameEngine.ANCHOR_ENUM.ANYWHERE)
    .pattern(rollCallPattern);

  if (shouldAddOtherBuilders) {
    const deviationBuilder = GameEngine.getDeviationRecognizerBuilder('deviation');
    const progressBuilder = GameEngine.getProgressRecognizerBuilder('progress');

    deviationBuilder.recognizer('sample_event');
    progressBuilder
      .completion(500)
      .recognizer('sample_event');

    gameEngine.setRecognizers(deviationBuilder, progressBuilder);
  }

  return gameEngine
    .setEvents(eventBuilder, timeoutEventBuilder.build())
    .setRecognizers(recognizerBuilder.build())
    .startInputHandler(gameEngineTimeout, proxies);
}
