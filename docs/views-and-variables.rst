.. _views-and-variables:

Views and Variables
====================

Views
-----

Views are the Voxa way of handling replies to the user, they're templates of responses that can have a context as
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

Variables
-----------

Variables are the rendering engine way of adding logic into your views. They're dessigned to be very simple since most of your logic should be in your :ref:`model <models>` or :ref:`controllers <controllers>`.

A variable signature is:

.. js:function:: variable(model, alexaEvent)

  :param model: The instance of your :ref:`model <models>` for the current alexa event.
  :param AlexaEvent: The current :ref:`alexa event <alexa-event>`.
  :returns: The value to be rendered or a promise resolving to a value to be rendered in the view.

.. code-block:: javascript

    const variables = {
      site: function site(model) {
        return Promise.resolve('example.com');
      },

      count: function count(model) {
        return model.count;
      },

      locale: function locale(model, alexaEvent) {
        return alexaEvent.locale;
      }
    };
