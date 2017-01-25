.. _middleware:

Middleware
=============

The framework offers a number of different options to add functionality to your skill application using middleware, much of the default behavior in the framework uses this same middleware, for example rendering the controllers result into a reply object is done in the ``onAfterStateChanged`` middleware, same goes for initializing the ``model`` and adding it to the request, that happens in a ``onRequestStarted`` middleware.

``onRequestStarted``
------------------------------------------

``onSessionEnded``
------------------------------------------

``onLaunch``
------------------------------------------

``onIntentRequest``
------------------------------------------

``onPlaybackFailed``
------------------------------------------

``onPlaybackFinished``
------------------------------------------

``onPlaybackStopped``
------------------------------------------

``onBeforeStateChanged``
------------------------------------------

``onBeforeReplySent``
------------------------------------------

``onAfterStateChanged``
------------------------------------------

``onBadResponse``
------------------------------------------

``onStateMachineError``
------------------------------------------

``onError``
------------------------------------------

