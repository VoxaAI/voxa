.. _debugging:

Debugging
===========

Voxa uses the `debug <http://npmjs.com/package/debug>`_ module internally to log a number of different internal events, if you want have a look at those events you have to declare the following environment variable 

``DEBUG=voxa``

This is an example of the log output

.. code-block:: bash

  voxa Received new event: {"version":"1.0","session":{"new":true,"sessionId":"SessionId.09162f2a-cf8f-414f-92e6-1e3616ecaa05","application":{"applicationId":"amzn1.ask.skill.1fe77997-14db-409b-926c-0d8c161e5376"},"attributes":{},"user":{"userId":"amzn1.ask.account.","accessToken":""}},"request":{"type":"LaunchRequest","requestId":"EdwRequestId.0f7b488d-c198-4374-9fb5-6c2034a5c883","timestamp":"2017-01-25T23:01:15Z","locale":"en-US"}} +0ms
  voxa Initialized model like {} +8ms
  voxa Starting the state machine from entry state +2s
  voxa Running simpleTransition for entry +1ms
  voxa Running onAfterStateChangeCallbacks +0ms
  voxa entry transition resulted in {"to":"launch"} +0ms
  voxa Running launch enter function +1ms
  voxa Running onAfterStateChangeCallbacks +0ms
  voxa launch transition resulted in {"reply":"Intent.Launch","to":"entry","message":{"tell":"Welcome mail@example.com!"},"session":{"data":{},"reply":null}} +7ms
