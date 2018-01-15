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

    skill.onState('launch', (voxaEvent) => {
      return { reply: 'LaunchIntent.OpenResponse', to: 'die' };
    });

.. js:function:: Voxa.onIntent(intentName, handler)

  A shortcut for definining state controllers that map directly to an intent

  :param string intentName: The name of the intent
  :param function/object handler: The controller to handle the state
  :returns: An object or a promise that resolves to an object that specifies a transition to another state and/or a view to render

  .. code-block:: javascript

    skill.onIntent('HelpIntent', (voxaEvent) => {
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

      skill.onBeforeReplySent((voxaEvent, reply) => {
        const rendered = reply.write();
        analytics.track(voxaEvent, rendered)
      });

.. js:function:: Voxa.onAfterStateChanged(callback, [atLast])

  Adds callbacks to be executed on the result of a state transition, this are called after every transition and internally it's used to render the :ref:`transition <transition>` ``reply`` using the :ref:`views and variables <views-and-variables>`

  The callbacks get ``voxaEvent``, ``reply`` and ``transition`` params, it should return the transition object

  .. code-block:: javascript

    skill.onAfterStateChanged((voxaEvent, reply, transition) => {
      if (transition.reply === 'LaunchIntent.PlayTodayLesson') {
        transition.reply = _.sample(['LaunchIntent.PlayTodayLesson1', 'LaunchIntent.PlayTodayLesson2']);
      }

      return transition;
    });


.. js:function:: Voxa.onUnhandledState(callback, [atLast])

  Adds a callback to be executed when a state transition fails to generate a result, this usually happens when redirecting to a missing state or an entry call for a non configured intent, the handlers get a :ref:`alexa event <alexa-event>` parameter and should return a :ref:`transition <transition>` the same as a state controller would.

.. js:function:: Voxa.onSessionStarted(callback, [atLast])

  Adds a callback to the ``onSessinStarted`` event, this executes for all events where ``voxaEvent.session.new === true``

  This can be useful to track analytics

  .. code-block:: javascript

    skill.onSessionStarted((voxaEvent, reply) => {
      analytics.trackSessionStarted(voxaEvent);
    });

.. js:function:: Voxa.onRequestStarted(callback, [atLast])

  Adds a callback to be executed whenever there's a ``LaunchRequest``, ``IntentRequest`` or a ``SessionEndedRequest``, this can be used to initialize your analytics or get your account linking user data. Internally it's used to initialize the model based on the event session

  .. code-block:: javascript

    skill.onRequestStarted((voxaEvent, reply) => {
      voxaEvent.model = this.config.Model.fromEvent(voxaEvent);
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
      return Promise.resolve(errorHandler(voxaEvent, error));
    }, null);



Error handlers
------------------------------------------

You can register many error handlers to be used for the different kind of errors the application could generate. They all follow the same logic where if the first error type is not handled then the default is to be deferred to the more general error handler that ultimately just returns a default error reply.

They're executed sequentially and will stop when the first handler returns a reply.

.. js:function:: Voxa.onStateMachineError(callback, [atLast])

  This handler will catch all errors generated when trying to make transitions in the stateMachine, this could include errors in the state machine controllers, , the handlers get ``(voxaEvent, reply, error)`` parameters

  .. code-block:: javascript

    skill.onStateMachineError((voxaEvent, reply, error) => {
      // it gets the current reply, which could be incomplete due to an error.
      return new Reply(voxaEvent, { tell: 'An error in the controllers code' })
        .write();
    });

.. js:function:: Voxa.onError(callback, [atLast])

  This is the more general handler and will catch all unhandled errors in the framework, it gets ``(voxaEvent, error)`` parameters as arguments

  .. code-block:: javascript

    skill.onError((voxaEvent, error) => {
      return new Reply(voxaEvent, { tell: 'An unrecoverable error occurred.' })
        .write();
    });



Playback Controller handlers
-----------------------------

Handle events from the `AudioPlayer interface <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/custom-audioplayer-interface-reference#requests>`_

.. js:function:: audioPlayerCallback(voxaEvent, reply)

  All audio player middleware callbacks get a :ref:`alexa event <alexa-event>` and a :ref:`reply <reply>` object

  :param AlexaEvent voxaEvent: The :ref:`alexa event <alexa-event>` sent by Alexa
  :param object reply: A reply to be sent as a response
  :returns object write: Your alexa event handler should return an appropriate response according to the event type, this generally means appending to the :ref:`reply <reply>` object

  In the following example the alexa event handler returns a ``REPLACE_ENQUEUED`` directive to a :js:func:`~Voxa.onAudioPlayer.PlaybackNearlyFinished` event.

  .. code-block:: javascript

    skill['onAudioPlayer.PlaybackNearlyFinished']((voxaEvent, reply) => {
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

Alexa Skill Event handlers
-----------------------------

Handle request for the `Alexa Skill Events <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/skill-events-in-alexa-skills#skill-events-in-json-format>`_

.. js:function:: alexaSkillEventCallback(alexaEvent)

  All the alexa skill event callbacks get a :ref:`alexa event <alexa-event>` and a :ref:`reply <reply>` object

  :param AlexaEvent alexaEvent: The :ref:`alexa event <alexa-event>` sent by Alexa
  :param object reply: A reply to be sent as the response
  :returns object reply: Alexa only needs an acknowledgement that you received and processed the event so it doesn't need to resend the event. Just returning the :ref:`reply <reply>` object is enough

  This is an example on how your skill can process a :js:func:`~Voxa.onAlexaSkillEvent.SkillEnabled` event.

  .. code-block:: javascript

    skill['onAlexaSkillEvent.SkillEnabled']((alexaEvent, reply) => {
      const userId = alexaEvent.user.userId;
      console.log(`skill was enabled for user: ${userId}`);
      return reply;
    });


.. js:function:: Voxa.onAlexaSkillEvent.SkillAccountLinked(callback, [atLast])

.. js:function:: Voxa.onAlexaSkillEvent.SkillEnabled(callback, [atLast])

.. js:function:: Voxa.onAlexaSkillEvent.SkillDisabled(callback, [atLast])

.. js:function:: Voxa.onAlexaSkillEvent.SkillPermissionAccepted(callback, [atLast])

.. js:function:: Voxa.onAlexaSkillEvent.SkillPermissionChanged(callback, [atLast])

Alexa List Event handlers
-----------------------------

Handle request for the `Alexa List Events <https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/docs/list-events-in-alexa-skills#list-events-json>`_

.. js:function:: alexaListEventCallback(alexaEvent)

  All the alexa list event callbacks get a :ref:`alexa event <alexa-event>` and a :ref:`reply <reply>` object

  :param AlexaEvent alexaEvent: The :ref:`alexa event <alexa-event>` sent by Alexa
  :param object reply: A reply to be sent as the response
  :returns object reply: Alexa only needs an acknowledgement that you received and processed the event so it doesn't need to resend the event. Just returning the :ref:`reply <reply>` object is enough

  This is an example on how your skill can process a :js:func:`~Voxa.onAlexaHouseholdListEvent.ItemsCreated` event.

  .. code-block:: javascript

    skill['onAlexaHouseholdListEvent.ItemsCreated']((alexaEvent, reply) => {
      const listId = alexaEvent.request.body.listId;
      const userId = alexaEvent.user.userId;
      console.log(`Items created for list: ${listId}` for user ${userId});
      return reply;
    });

.. js:function:: Voxa.onAlexaHouseholdListEvent.ItemsCreated(callback, [atLast])

.. js:function:: Voxa.onAlexaHouseholdListEvent.ItemsUpdated(callback, [atLast])

.. js:function:: Voxa.onAlexaHouseholdListEvent.ItemsDeleted(callback, [atLast])
