.. _views:

Views
=========

Responses are the Alexa Statemachine way of handling replies to the user, they're templates of responses that can have a context as
defined by your variables and Model

There are 5 responses in the following snippet: ``LaunchIntent.OpenResponse``, ``ExitIntent.Farewell``, ``HelpIntent.HelpAboutSkill``, ``Count.Say`` and ``Count.tell``

.. code-block:: javascript

  const views = {
    LaunchIntent: {
      OpenResponse: { tell: 'Hello! Good {time}' },
    },
    ExitIntent: {
      Farewell: { tell: 'Ok. For more info visit {site} site.' },
    },
    HelpIntent: {
      HelpAboutSkill: { tell: 'For more help visit www.rain.agency' },
    },
    Count: {
      Say: { say: '{count}' },
      Tell: { tell: '{count}' },
    },
  };
