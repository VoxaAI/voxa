.. _api:

API
===

.. js:class:: StateMachineSkill(appId, config)

  :param string/array appId: The application id that amazon gives you in the developer website
  :param object config: Configuration for your skill, it should include a :ref:`models` and :ref:`views-and-variables`
    optionally it can also take an ``env`` parameter.

    If ``env === 'production'`` the framework will require ``request.application.applicationId`` to equal ``appId``.

.. js:function:: StateMachineSkill.onState(stateName, handler)

  Maps a handler to a state

  :param string stateName: The name of the state
  :param function/object handler: The controller to handle the state
  :returns: An object or a promise that resolves to an object that specifies a transition to another state and/or a view to render

.. js:function:: StateMachineSkill.onIntent(intentName, handler)

  A shortcut for definining state controllers that map directly to an intent

  :param string intentName: The name of the intent 
  :param function/object handler: The controller to handle the state
  :returns: An object or a promise that resolves to an object that specifies a transition to another state and/or a view to render

.. js:function:: StateMachineSkill.onBeforeStateChanged(callback)

.. js:function:: StateMachineSkill.onBeforeReplySent(callback)

.. js:function:: StateMachineSkill.onAfterStateChanged(callback)

.. js:function:: StateMachineSkill.onBadResponse(callback)

.. js:function:: StateMachineSkill.onStateMachineError(callback)

.. js:function:: StateMachineSkill.onSessionStarted(callback)

.. js:function:: StateMachineSkill.onRequestStarted(callback)

.. js:function:: StateMachineSkill.onSessionEnded(callback)

.. js:function:: StateMachineSkill.onError(callback)

.. js:function:: StateMachineSkill.execute(event)
