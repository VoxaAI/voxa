.. _gameEngine:

Game Engine Interface Reference
===============================

The `Game Engine interface <https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html>`_ enables your skill to receive input from Echo Buttons. This interface works with compatible Amazon Echo devices only.

Your skill uses the Game Engine Interface by sending directives that start and stop the Input Handler, which is the component within Alexa that sends your skill Echo Button events when conditions that you define are met (for example, the user pressed a certain sequence of buttons).

With Voxa, you can implement this interface like this:

.. code-block:: javascript

  const voxa = require('voxa');
  const { ANCHOR_ENUM, EVENT_REPORT_ENUM, GameEngine } = voxa.alexa;

  app.onIntent('LaunchIntent', (voxaEvent) => {
    const alexaGameEngineStartInputHandler = rollCall(voxaEvent);

    return {
      alexaGameEngineStartInputHandler,
      tell: 'Buttons.Discover',
    };
  });

  function rollCall(voxaEvent) {
    const gameEngineTimeout = 15000;
    const eventBuilder = GameEngine.getEventsBuilder('sample_event');
    const timeoutEventBuilder = GameEngine.getEventsBuilder('timeout');
    const recognizerBuilder = GameEngine.getPatternRecognizerBuilder('sample_event');

    eventBuilder
      .fails(['fails'])
      .meets(['sample_event'])
      .maximumInvocations(1)
      .reports(EVENT_REPORT_ENUM.MATCHES)
      .shouldEndInputHandler(true)
      .triggerTimeMilliseconds(1000);

    timeoutEventBuilder
      .meets(['timed out'])
      .reports(EVENT_REPORT_ENUM.HISTORY)
      .shouldEndInputHandler(true);

    recognizerBuilder
      .actions('actions')
      .fuzzy(true)
      .gadgetIds(['gadgetIds'])
      .anchor(ANCHOR_ENUM.ANYWHERE)
      .pattern(rollCallPattern);

    return gameEngine
      .setEvents(eventBuilder, timeoutEventBuilder.build())
      .setRecognizers(recognizerBuilder.build())
      .startInputHandler(gameEngineTimeout, proxies);
  }


The `recognizers <https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#recognizers>`_ object contains one or more objects that represent different types of recognizers: the patternRecognizer, deviationRecognizer, or progressRecognizer. In addition to these recognizers, there is a predefined timed out recognizer. All of these recognizers are described next.

The `events <https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#events>`_ object is where you define the conditions that must be met for your skill to be notified of Echo Button input. You must define at least one event.

If there's an error when you send these directives, Alexa will return a `System ExceptionEncountered <https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#system-exceptionencountered>`_ request.

A very simple example on how the GameEngine.InputHandlerEvent JSON request from Alexa looks like is:

.. code-block:: json

  {
    "version": "1.0",
    "session": {
      "application": {},
      "user": {},
      "request": {
        "type": "GameEngine.InputHandlerEvent",
        "requestId": "amzn1.echo-api.request.406fbc75-8bf8-4077-a73d-519f53d172a4",
        "timestamp": "2017-08-18T01:29:40.027Z",
        "locale": "en-US",
        "originatingRequestId": "amzn1.echo-api.request.406fbc75-8bf8-4077-a73d-519f53d172d6",
        "events": [
          {
            "name": "myEventName",
            "inputEvents": [
              {
                "gadgetId": "someGadgetId1",
                "timestamp": "2017-08-18T01:32:40.027Z",
                "action": "down",
                "color": "FF0000"
              }
            ]
          }
        ]
      }
    }
  }


The field ``originatingRequestId`` provides the requestId of the request to which you responded with a StartInputHandler directive. You need to save this value in your session attributes to send the `StopInputHandler <https://developer.amazon.com/docs/gadget-skills/gameengine-interface-reference.html#stop>`_ directive. You can send this directive with Voxa as follows:

.. code-block:: javascript

  const voxa = require('voxa');

  app.onIntent('ExitIntent', (voxaEvent) => {
    const { originatingRequestId } = voxaEvent.model;

    return {
      alexaGameEngineStopInputHandler: originatingRequestId,
      tell: 'Buttons.Bye',
    };
  });

This will stop Echo Button events to be sent to your skill.
