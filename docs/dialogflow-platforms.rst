.. _dialogflow-platforms:

================================
Dialogflow Platform Integrations
================================
Dialogflow offers a variety of integrations so you share your base code across several platforms like Google Assistant, Facebook Messenger and more. For more information about these platforms, visit their `Integration docs <https://dialogflow.com/docs/integrations>`_.

More integrations comming soon to Voxa


.. _facebook:

Facebook Messenger
==================

The ``DialogflowPlatform`` for voxa has available some of the core functionalities to send to your chatbot in responses. For now, you can integrate:

- Account Linking buttons
You need to include in your controller the following field: ``facebookAccountLink``, which takes a URL to go into the account linking flow.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookAccountLink: "https://www.messenger.com"
    }
  });

- Postbacks buttons (Suggestion chips)
You need to include in your controller the following field: ``facebookSuggestionChips``, which could be a simple string that the Voxa renderer will get from your views file with an array of strings, or directly an array of strings.

.. code-block:: javascript

  app.onState('someState', () => {
    return {
      facebookSuggestionChips: ["YES", "NO"],
      textp: "Select YES or NO",
      to: "entry",
    }
  });

For more information check the `Dialogflow documentation for Facebook Messenger <https://dialogflow.com/docs/integrations/facebook>`_



.. _telegram:

Telegram
=========

The ``DialogflowPlatform`` for voxa can be easily integrated with telegram, just make sure to use
``text`` responses in your controllers and everything should work as usual.

For more information check the `Dialogflow documentation for telegram <https://dialogflow.com/docs/integrations/telegram>`_
