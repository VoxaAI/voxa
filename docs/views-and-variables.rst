.. _views-and-variables:

Views and Variables
====================

Views
-----

Views are the Voxa way of handling replies to the user, they're templates of responses using a simple javascript DSL. They can contain ssml and include cards.

There are 5 responses in the following snippet: ``LaunchIntent.OpenResponse``, ``ExitIntent.Farewell``, ``HelpIntent.HelpAboutSkill``, ``Count.Say`` and ``Count.Tell``

Also, there's a special type of view which can contain arrays of options, when Voxa finds one of those like the ``LaunchIntent.OpenResponse`` it will select a random sample and use it as the response.

I18N
-----

Internationalization support is done using the `i18next <http://i18next.com/>`_ library, the same the Amazon Alexa Node SDK uses.

The framework takes care of selecting the correct locale on every voxa event by looking at the ``voxaEvent.request.locale`` property.


.. code-block:: javascript

  const views = {
    en: {
      translaction: {
        LaunchIntent: {
          OpenResponse: [
            'Hello! <break time="3s"/> Good  {time}. Is there anything i can do to help you today?',
            'Hi there! <break time="3s"/> Good  {time}. How may i be of service?',
            'Good  {time}, Welcome!. How can i help you?',
          ]
        },
        ExitIntent: {
          Farewell: 'Ok. For more info visit {site} site.',
        },
        HelpIntent: {
          HelpAboutSkill: 'For more help visit example dot com'
        },
        Count: {
          Say: '{count}',
          Tell: '{count}',
        },
      }
    }
  };


Variables
-----------

Variables are the rendering engine way of adding logic into your views. They're dessigned to be very simple since most of your logic should be in your :ref:`model <models>` or :ref:`controllers <controllers>`.

A variable signature is:

.. js:function:: variable(model, voxaEvent)

  :param voxaEvent: The current :ref:`voxa event <voxa-event>`.
  :returns: The value to be rendered or a promise resolving to a value to be rendered in the view.

.. code-block:: javascript

    const variables = {
      site: function site(voxaEvent) {
        return Promise.resolve('example.com');
      },

      count: function count(voxaEvent) {
        return voxaEvent.model.count;
      },

      locale: function locale(voxaEvent) {
        return voxaEvent.locale;
      }
    };
