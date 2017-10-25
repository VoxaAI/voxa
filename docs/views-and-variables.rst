.. _views-and-variables:

Views and Variables
====================

Views
-----

Views are the Voxa way of handling replies to the user, they're templates of responses using a simple javascript DSL. They can contain ssml and include cards.

There are 5 responses in the following snippet: ``LaunchIntent.OpenResponse``, ``ExitIntent.Farewell``, ``HelpIntent.HelpAboutSkill``, ``Count.Say`` and ``Count.Tell``

Also, there's a special type of view which can contain arrays of options, when Voxa finds one of those like the ``LaunchIntent.OpenResponse`` it will select a random sample and use it as the response.


.. code-block:: javascript

  const views = {
    LaunchIntent: {
      OpenResponse: {
        tell: [
          'Hello! <break time="3s"/> Good  {time}. Is there anything i can do to help you today?',
          'Hi there! <break time="3s"/> Good  {time}. How may i be of service?',
          'Good  {time}, Welcome!. How can i help you?',
        ]
      },
    },
    ExitIntent: {
      Farewell: { tell: 'Ok. For more info visit {site} site.' },
    },
    HelpIntent: {
      HelpAboutSkill: {
        tell: 'For more help visit example dot com'
        card: {
          type: 'Standard',
          text: 'Help is available at is http://example.com',
        },
      },
    },
    Count: {
      Say: { say: '{count}' },
      Tell: { tell: '{count}' },
    },
  };

They come in 3 forms: ``say``, ``ask`` and ``tell``.

tell
****

Tell views send a response to alexa and close the session inmediately. They're used when the skill is done interacting with the user. The ``ExitIntent.Farewell`` is an example of this.

ask
****

Ask views are used to prompt the user for information, they send a response to alexa but keep the session open so the user can respond. The ``LaunchIntent.OpenResponse`` is an ask view.

say
***

While the ``tell`` and ``ask`` view types are an exact representation of the base alexa programming model, the say views are different. They're an abstraction created by voxa to make it simpler to compose your responses over many state transitions. They don't send a respond to alexa but instead make a state transition internally and continue executing your skill code until there's a ``tell`` or ``ask`` response.


Directives
-----------

Now you can include directives in your views file. Hint directive can be easily specify with a simple object containing a hint key.

.. code-block:: javascript

  const views = {
    LaunchIntent: {
      OpenResponse: {
        tell: [
          'Hello! <break time="3s"/> Good  {time}. Is there anything i can do to help you today?',
          'Hi there! <break time="3s"/> Good  {time}. How may i be of service?',
          'Good  {time}, Welcome!. How can i help you?',
        ],

        directives: [
          {
            hint: 'hint',
          },
          {
            type: 'Display.RenderTemplate',
            template: {
              type: "BodyTemplate1",
              textContent: {
                primaryText: {
                    text: "See my favorite car",
                    type: "PlainText"
                },
                secondaryText: {
                    text: "Custom-painted",
                    type: "PlainText"
                },
                tertiaryText: {
                    text: "By me!",
                    type: "PlainText"
                  }
              },
              backButton: "VISIBLE"
            }
          }
      ],
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
