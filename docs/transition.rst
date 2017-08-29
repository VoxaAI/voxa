.. _transition:

Transition
===========

A transition is the result of controller execution, it's a simple object with keys that control the flow of execution in your skill. 

``to``
------

The ``to`` key should be the name of a state in your state machine, when present it indicates to the framework that it should move to a new state. If absent it's assumed that the framework should move to the ``die`` state.

.. code-block:: javascript

  return { to: 'stateName' };


``directives``
--------------

Directives are used passed directly to the alexa response, the format is described in `the alexa documentation <https://developer.amazon.com/public/solutions/alexa/alexa-voice-service/reference/interaction-model#interfaces>`_

.. code-block:: javascript

  return {
    directives: [{
      type: 'AudioPlayer.Play',
      playBehavior: 'REPLACE_ALL',
      audioItem: {
        stream: {
          token: lesson.id,
          url: lesson.Url,
          offsetInMilliseconds: 0,
        }
      }
    }],
  };

``reply``
---------

The ``reply`` key can take 2 forms, a simple string pointing to one of your views or a :ref:`Reply <reply>` object. 

.. code-block:: javascript

  return { reply: 'LaunchIntent.OpenResponse' };

  const reply = new Reply(alexaEvent, { tell: 'Hi there!' });
  return { reply };

