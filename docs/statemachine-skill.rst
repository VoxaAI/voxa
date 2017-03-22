.. _statemachine-skill:

Voxa
==================

.. js:class:: Voxa(config)

  :param config: Configuration for your skill, it should include :ref:`views-and-variables` and optionally a :ref:`model <models>` and a list of appIds.

  If appIds is present then the framework will check every alexa event and enforce the application id to match one of the specified application ids.

  .. code-block:: javascript

    const skill = new Voxa({ Model, variables, views, appIds });

.. js:function:: Voxa.lambda()


  :returns: A lambda handler that will call your :js:func:`skill.execute <Voxa.execute>` method

  .. code-block:: javascript

      exports.handler = skill.lambda();

.. js:function:: Voxa.execute(event)

  The main entry point for the Skill execution

  :param event: The event sent by alexa.
  :param context: The context of the lambda function
  :returns Promise: A response resolving to a javascript object to be sent as a result to Alexa.

  .. code-block:: javascript

      skill.execute(event, context)
        .then(result => callback(null, result))
        .catch(callback);

.. js:function:: Voxa.onState(stateName, handler)

  Maps a handler to a state

  :param string stateName: The name of the state
  :param function/object handler: The controller to handle the state
  :returns: An object or a promise that resolves to an object that specifies a transition to another state and/or a view to render

  .. code-block:: javascript

    skill.onState('entry', {
      LaunchIntent: 'launch',
      'AMAZON.HelpIntent': 'help',
    });

    skill.onState('launch', (alexaEvent) => {
      return { reply: 'LaunchIntent.OpenResponse', to: 'die' };
    });

.. js:function:: Voxa.onIntent(intentName, handler)

  A shortcut for definining state controllers that map directly to an intent

  :param string intentName: The name of the intent
  :param function/object handler: The controller to handle the state
  :returns: An object or a promise that resolves to an object that specifies a transition to another state and/or a view to render

  .. code-block:: javascript

    skill.onIntent('HelpIntent', (alexaEvent) => {
      return { reply: 'HelpIntent.HelpAboutSkill' };
    });

.. js:function:: Voxa.onIntentRequest(callback, [atLast])

  This is executed for all ``IntentRequest`` events, default behavior is to execute the State Machine machinery, you generally don't need to override this.

  :param function callback:
  :param bool last:
  :returns: Promise

.. js:function:: Voxa.onLaunchRequest(callback, [atLast])

  Adds a callback to be executed when processing a ``LaunchRequest``, the default behavior is to fake the :ref:`alexa event <alexa-event>` as an ``IntentRequest`` with a ``LaunchIntent`` and just defer to the ``onIntentRequest`` handlers. You generally don't need to override this.

.. js:function:: Voxa.onBeforeStateChanged(callback, [atLast])

  This is executed before entering every state, it can be used to track state changes or make changes to the :ref:`alexa event <alexa-event>` object

.. js:function:: Voxa.onBeforeReplySent(callback, [atLast])

  Adds a callback to be executed just before sending the reply, internally this is used to add the serialized model and next state to the session.

  It can be used to alter the reply, or for example to track the final response sent to a user in analytics.

  .. code-block:: javascript

      skill.onBeforeReplySent((alexaEvent, reply) => {
        const rendered = reply.write();
        analytics.track(alexaEvent, rendered)
      });

.. js:function:: Voxa.onAfterStateChanged(callback, [atLast])

  Adds callbacks to be executed on the result of a state transition, this are called after every transition and internally it's used to render the :ref:`transition <transition>` ``reply`` using the :ref:`views and variables <views-and-variables>`

  The callbacks get ``alexaEvent``, ``reply`` and ``transition`` params, it should return the transition object

  .. code-block:: javascript

    skill.onAfterStateChanged((alexaEvent, reply, transition) => {
      if (transition.reply === 'LaunchIntent.PlayTodayLesson') {
        transition.reply = _.sample(['LaunchIntent.PlayTodayLesson1', 'LaunchIntent.PlayTodayLesson2']);
      }

      return transition;
    });


.. js:function:: Voxa.onUnhandledState(callback, [atLast])

  Adds a callback to be executed when a state transition fails to generate a result, this usually happens when redirecting to a missing state or an entry call for a non configured intent, the handlers get a :ref:`alexa event <alexa-event>` parameter and should return a :ref:`transition <transition>` the same as a state controller would.

.. js:function:: Voxa.onSessionStarted(callback, [atLast])

  Adds a callback to the ``onSessinStarted`` event, this executes for all events where ``alexaEvent.session.new === true``

  This can be useful to track analytics

  .. code-block:: javascript

    skill.onSessionStarted((alexaEvent, reply) => {
      analytics.trackSessionStarted(alexaEvent);
    });

.. js:function:: Voxa.onRequestStarted(callback, [atLast])

  Adds a callback to be executed whenever there's a ``LaunchRequest``, ``IntentRequest`` or a ``SessionEndedRequest``, this can be used to initialize your analytics or get your account linking user data. Internally it's used to initialize the model based on the event session

  .. code-block:: javascript

    skill.onRequestStarted((alexaEvent, reply) => {
      alexaEvent.model = this.config.Model.fromEvent(alexaEvent);
    });


.. js:function:: Voxa.onSessionEnded(callback, [atLast])

  Adds a callback to the ``onSessionEnded`` event, this is called for every ``SessionEndedRequest`` or when the skill returns a transition to a state where ``isTerminal === true``, normally this is a transition to the ``die`` state. You would normally use this to track analytics



.. js:function:: Voxa.onSystem.ExceptionEncountered(callback, [atLast])

  This handles `System.ExceptionEncountered <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#system-exceptionencountered>`_ event that are sent to your skill when a response to an ``AudioPlayer`` event causes an error


  .. code-block:: javascript

    return Promise.reduce(errorHandlers, (result, errorHandler) => {
      if (result) {
        return result;
      }
      return Promise.resolve(errorHandler(alexaEvent, error));
    }, null);



Error handlers
------------------------------------------

You can register many error handlers to be used for the different kind of errors the application could generate. They all follow the same logic where if the first error type is not handled then the default is to be deferred to the more general error handler that ultimately just returns a default error reply.

They're executed sequentially and will stop when the first handler returns a reply.

.. js:function:: Voxa.onStateMachineError(callback, [atLast])

  This handler will catch all errors generated when trying to make transitions in the stateMachine, this could include errors in the state machine controllers, , the handlers get ``(alexaEvent, reply, error)`` parameters

  .. code-block:: javascript

    skill.onStateMachineError((alexaEvent, reply, error) => {
      // it gets the current reply, which could be incomplete due to an error.
      return new Reply(alexaEvent, { tell: 'An error in the controllers code' })
        .write();
    });

.. js:function:: Voxa.onError(callback, [atLast])

  This is the more general handler and will catch all unhandled errors in the framework, it gets ``(alexaEvent, error)`` parameters as arguments

  .. code-block:: javascript

    skill.onError((alexaEvent, error) => {
      return new Reply(alexaEvent, { tell: 'An unrecoverable error occurred.' })
        .write();
    });



Playback Controller handlers
-----------------------------

Handle events from the `AudioPlayer interface <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#requests>`_

.. js:function:: audioPlayerCallback(alexaEvent, reply)

  All audio player middleware callbacks get a :ref:`alexa event <alexa-event>` and a :ref:`reply <reply>` object

  :param AlexaEvent alexaEvent: The :ref:`alexa event <alexa-event>` sent by Alexa
  :param object reply: A reply to be sent as a response
  :returns object write: Your alexa event handler should return an appropriate response according to the event type, this generally means appending to the :ref:`reply <reply>` object

  In the following example the alexa event handler returns a ``REPLACE_ENQUEUED`` directive to a :js:func:`~Voxa.onAudioPlayer.PlaybackNearlyFinished` event.

  .. code-block:: javascript

    skill['onAudioPlayer.PlaybackNearlyFinished']((alexaEvent, reply) => {
      const directives = {
        type: 'AudioPlayer.Play',
        playBehavior: 'REPLACE_ENQUEUED',
        token: "",
        url: 'https://www.dl-sounds.com/wp-content/uploads/edd/2016/09/Classical-Bed3-preview.mp3',
        offsetInMilliseconds: 0,
      };

      return reply.append({ directives });
    });


.. js:function:: Voxa.onAudioPlayer.PlaybackStarted(callback, [atLast])

.. js:function:: Voxa.onAudioPlayer.PlaybackFinished(callback, [atLast])

.. js:function:: Voxa.onAudioPlayer.PlaybackStopped(callback, [atLast])

.. js:function:: Voxa.onAudioPlayer.PlaybackFailed(callback, [atLast])

.. js:function:: Voxa.onAudioPlayer.PlaybackNearlyFinished(callback, [atLast])

.. js:function:: Voxa.onPlaybackController.NextCommandIssued(callback, [atLast])

.. js:function:: Voxa.onPlaybackController.PauseCommandIssued(callback, [atLast])

.. js:function:: Voxa.onPlaybackController.PlayCommandIssued(callback, [atLast])

.. js:function:: Voxa.onPlaybackController.PreviousCommandIssued(callback, [atLast])
