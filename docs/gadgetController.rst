.. _gadgetController:

Gadget Controller Interface Reference
=====================================

The `Gadget Controller interface <https://developer.amazon.com/docs/gadget-skills/gadgetcontroller-interface-reference.html>`_ enables your skill to control Echo Buttons. This interface works with compatible Amazon Echo devices only. With the Gadget Controller interface, you can send animations to illuminate the buttons with different colors in a specific order.

With Voxa, you can implement this interface like this:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });
  skill.onIntent('GameEngineInputHandlerEvent', (voxaEvent) => {
    // REMEMBER TO SAVE THE VALUE originatingRequestId in your model
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
        const GadgetController = voxaEvent.model.gadgetController;
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

    return { reply: 'ButtonsNext', directives, to: 'entry' };
  });

If there's an error when you send this directive, Alexa will return a `System ExceptionEncountered <https://developer.amazon.com/docs/gadget-skills/gadgetcontroller-interface-reference.html#system-exceptionencountered>`_ request.

A very simple example on how the GadgetController.SetLight JSON response looks like is:

.. code-block:: json

  {
    "version": "1.0",
    "sessionAttributes": {},
    "shouldEndSession": true,
    "response": {
      "outputSpeech": "outputSpeech",
      "reprompt": "reprompt",
      "directives": [
        {
          "type": "GadgetController.SetLight",
          "version": 1,
          "targetGadgets": [ "gadgetId1", "gadgetId2" ],
          "parameters": {
            "triggerEvent": "none",
            "triggerEventTimeMs": 0,
            "animations": [
              {
                "repeat": 1,
                "targetLights": ["1"],
                "sequence": [
                  {
                    "durationMs": 10000,
                    "blend": false,
                    "color": "0000FF"
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  }
