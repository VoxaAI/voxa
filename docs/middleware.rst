.. _middleware:

Middleware
=============

The framework offers a number of different options to add functionality to your skill application using middleware, much of the default behavior in the framework uses this same middleware, for example rendering the controllers result into a reply object is done in the ``onAfterStateChanged`` middleware, same goes for initializing the ``model`` and adding it to the :ref:`request`, that happens in a ``onRequestStarted`` middleware.

``onRequestStarted``
------------------------------------------

The first middleware to run, it's executed for ``LaunchRequest``, ``IntentRequest`` and ``SessionEndedRequest`` events.

.. code-block:: javascript

  skill.onRequestStarted((request, reply) => {
    request.model = this.config.Model.fromRequest(request);
  });


``onSessionStarted``
------------------------------------------

Adds a callback to the ``onSessinStarted`` event, this executes for all events where ``request.session.new === true``

This can be useful to track analytics

.. code-block:: javascript

  skill.onSessionStarted((request, reply) => {
    analytics.trackSessionStarted(request);
  });

``onLaunchRequest``
------------------------------------------

Adds a callback to be executed when processing a ``LaunchRequest``, the default behavior is to fake the request as an ``IntentRequest`` with a ``LaunchIntent`` and just defer to the ``onIntentRequest`` handlers. You generally don't need to override this.

``onIntentRequest``
------------------------------------------
This is executed for all ``IntentRequest`` events, default behavior is to execute the State Machine machinery, you generally don't need to override this.

``onBeforeStateChanged``
------------------------------------------
This is executed before entering every state, it can be used to track state changes or make changes to the :ref:`request <request>` object

``onAfterStateChanged``
------------------------------------------
Executed just after the state returns a result, it has a different signature cause it also gets the result of the state execution. Main purpose is to alter the state result, the default state machine uses it to do the actual rendering.

It should return the result object at the end;

.. code-block:: javascript

  skill.onAfterStateChanged((request, reply, transition) => {
    if (transition.reply === 'LaunchIntent.PlayTodayLesson') {
      transition.reply = _.sample(['LaunchIntent.PlayTodayLesson1', 'LaunchIntent.PlayTodayLesson2']);
    }

    return transition;
  });

``onSessionEnded``
------------------------------------------

Adds a callback to the ``onSessionEnded`` event, this is called for every ``SessionEndedRequest`` or when the skill returns a transition to a state where ``isTerminal === true``, normally this is a transition to the ``die`` state. You would normally use this to track analytics

``onBeforeReplySent``
------------------------------------------

This middleware is executed when the stateMachine transition is finished, just before the reply is sent. It can be used to alter the reply, or for example to track the final response sent to a user in analytics.

.. code-block:: javascript

    skill.onBeforeReplySent((request, reply) => {
      const rendered = reply.write();
      analytics.track(request, rendered)
    });

Audio Player Requests
------------------------

This middleware handle requests from the `AudioPlayer interface <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#requests>`_

``onAudioPlayer.PlaybackStarted``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onAudioPlayer.PlaybackFinished``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onAudioPlayer.PlaybackNearlyFinished``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onAudioPlayer.PlaybackStopped``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onAudioPlayer.PlaybackFailed``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onSystem.ExceptionEncountered``
----------------------------------

This middleware handles requests for the `System.ExceptionEncountered <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#system-exceptionencountered>`_ request that is sent to your skill when a response to an ``AudioPlayer`` request causes an error

Playback Controller Requests
-----------------------------

This middleware handles requests from the `Playback Controller interface <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-playbackcontroller-interface-reference#requests>`_

``onPlaybackController.NextCommandIssued``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onPlaybackController.PauseCommandIssued``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onPlaybackController.PlayCommandIssued``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onPlaybackController.PreviousCommandIssued``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Error handlers
------------------------------------------

You can register many error handlers to be used for the different kind of errors the application could generate. They all follow the same logic where if the first error type is not handled then the default is to be deferred to the more general error handler that ultimately just returns a default error reply.

They're executed sequentially and will stop when the first handler returns a reply.

.. code-block:: javascript

  return Promise.reduce(errorHandlers, (result, errorHandler) => {
    if (result) {
      return result;
    }
    return Promise.resolve(errorHandler(request, error));
  }, null);

``onBadResponse``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onBadResponse`` is thrown whenever a state transition fails to generate a result, this usually happens when redirecting to a missing state or an entry call for a non configured intent, the handlers get ``(request, reply, error)`` parameters

``onStateMachineError``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This handler will catch all errors generated when trying to make transitions in the stateMachine, this could include errors in the state machine controllers, , the handlers get ``(request, reply, error)`` parameters

.. code-block:: javascript

  skill.onStateMachineError((request, reply, error) => {
    // it gets the current reply, which could be incomplete due to an error.
    return new Reply(request, { tell: 'An error in the controllers code' }).write();
  });

``onError``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This is the more general handler and will catch all unhandled errors in the framework, it gets ``(request, error)`` parameters as arguments

.. code-block:: javascript

  skill.onError((request, error) => {
    return new Reply(request, { tell: 'An unrecoverable error occurred.' }).write();
  });
