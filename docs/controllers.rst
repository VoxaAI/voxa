.. _controllers:

Controllers
=============

Controllers in your application control the logic of your skill, they respond to alexa voxaEvents, external resources, manipulate the input and give proper responses using your :ref:`Model <models>`, :ref:`views-and-variables`.

States come in one of two ways, they can be an object with a transition.

.. code-block:: javascript

  app.onState('HelpIntent', {
    tell: "Help"
  });


Or they can be a function that gets a :ref:`voxaEvent <voxa-event>` object.

.. code-block:: javascript

  app.onState('launch', (voxaEvent) => {
    return { tell: 'LaunchIntent.OpenResponse' };
  });

Your state should respond with a :ref:`transition <transition>`. The transition is a plain object that can take  ``directives``, ``to`` and ``flow`` keys.

``onState`` also takes a third parameter which can be used to limit which intents a controller can respond, for example

.. code-block:: javascript

  app.onState('shouldSendEmail?', {
    sayp: "All right! An email has been sent to your inbox",
    flowp: "terminate"
  }, "YesIntent");

  app.onState('shouldSendEmail?', {
    sayp: "No problem, is there anything else i can help you with?",
    flowp: "yield"
  }, "NoIntent");


The ``onIntent`` helper
-----------------------

For the simple pattern of having a controller respond to an specific intent the framework provides the ``onIntent`` helper

.. code-block:: javascript

  app.onIntent('LaunchIntent', (voxaEvent) => {
    return { tell: 'LaunchIntent.OpenResponse' };
  });

If you receive a Display.ElementSelected type request, you could use the same approach for intents and state. Voxa receives this type of request and turns it into ``DisplayElementSelected`` Intent

.. code-block:: javascript

  app.onIntent('DisplayElementSelected', (voxaEvent) => {
    return { tell: 'DisplayElementSelected.OpenResponse' };
  });

Keep in mind that controllers created with ``onIntent`` won't accept transitions from other states with a different intent
