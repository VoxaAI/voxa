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

Directives is an array of directive objects that implement the ``IDirective`` interface, they can make modifications to the reply object directly

.. code-block:: javascript

  const { PlayAudio } = require('voxa').alexa;

  return {
    directives: [new PlayAudio(url, token)],
  };


``flow``
--------

The ``flow`` key can take one of three values:

``continue``:
  This is the default value if the flow key is not present, it merely continues the state machine execution with an internal transition, it keeps building the response until a controller returns a ``yield`` or a ``terminate`` flow.

``yield``:
  This stops the state machine and returns the current response to the user without terminating the session.

``terminate``:
  This stops the state machine and returns the current response to the user, it closes the session.


``say``
-------

Used to render a view and add the result to the response


``reprompt``
------------

Used to render a view and add the result to the response as a reprompt


``reply``
---------

.. code-block:: javascript

  return { reply: 'LaunchIntent.OpenResponse' };

  const reply = new Reply(voxaEvent, { tell: 'Hi there!' });
  return { reply };

