.. _middleware:

Middleware
=============

The framework offers a number of different options to add functionality to your skill application using middleware, much of the default behavior in the framework uses this same middleware, for example rendering the controllers result into a reply object is done in the ``onAfterStateChanged`` middleware, same goes for initializing the ``model`` and adding it to the :ref:`request <request>`, that happens in a ``onRequestStarted`` middleware.

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

Adds a callback to be executed when processing a ``LaunchRequest``, the default behavior is to fake the :ref:`request <request>` as an ``IntentRequest`` with a ``LaunchIntent`` and just defer to the ``onIntentRequest`` handlers. You generally don't need to override this.

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

``onUnhandledState``
------------------------------------------

Adds a callback to be executed when a state transition fails to generate a result, this usually happens when redirecting to a missing state or an entry call for a non configured intent, the handlers get a :ref:`request <request>` parameter and should return a :ref:`transition <transition>` the same as a state controller would.

Audio Player Requests
------------------------

This middleware handle requests from the `AudioPlayer interface <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#requests>`_

.. js:function:: audioPlayerCallback(request, reply)
  
  All audio player middleware callbacks get a :ref:`request <request>` and a :ref:`reply <reply>` object

  :param object request: The :ref:`request <request>` sent by Alexa
  :param object reply: A reply to be sent as a response
  :returns object write: Your request handler should return an appropriate response according to the request type, this generally means appending to the :ref:`reply <reply>` object and then returning ``reply.write()``

``onAudioPlayer.PlaybackStarted``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onAudioPlayer.PlaybackFinished``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

``onAudioPlayer.PlaybackNearlyFinished``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In the following example the request handler returns a ``REPLACE_ENQUEUED`` directive to a ``PlaybackNearlyFinished`` request.

.. code-block:: javascript

  skill['onAudioPlayer.PlaybackNearlyFinished']((request, reply) => {
    const directives = {
      type: 'AudioPlayer.Play',
      playBehavior"" 'REPLACE_ENQUEUED',
      token: "",
      url: 'https://www.dl-sounds.com/wp-content/uploads/edd/2016/09/Classical-Bed3-preview.mp3',
      offsetInMilliseconds: 0,
    };

    return reply.append({ directives }).write();
  });

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


``onStateMachineError``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This handler will catch all errors generated when trying to make transitions in the stateMachine, this could include errors in the state machine controllers, , the handlers get ``(request, reply, error)`` parameters

.. code-block:: javascript

  skill.onStateMachineError((request, reply, error) => {
    // it gets the current reply, which could be incomplete due to an error.
    return new Reply(request, { tell: 'An error in the controllers code' })
      .write();
  });

``onError``
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This is the more general handler and will catch all unhandled errors in the framework, it gets ``(request, error)`` parameters as arguments

.. code-block:: javascript

  skill.onError((request, error) => {
    return new Reply(request, { tell: 'An unrecoverable error occurred.' })
      .write();
  });
