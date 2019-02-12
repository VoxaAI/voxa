.. _dialogflow-events:

The ``GoogleAssistantEvent`` Object
==============================

.. js:class:: GoogleAssistantEvent(event, lambdaContext)

  The ``googleAssistantEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: GoogleAssistantEvent.google.conv

    The conversation instance that contains the raw input sent by Dialogflow


The ``FacebookEvent`` Object
==============================

.. js:class:: FacebookEvent(event, lambdaContext)

  The ``facebookEvent`` object contains all the information from the Voxa event for the Facebook Messenger platform, just like Google Assistant events.
