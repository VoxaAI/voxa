.. _dialogflow-event:

The ``DialogflowEvent`` Object
==============================

.. js:class:: DialogflowEvent(event, lambdaContext)

  The ``dialogflowEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: DialogflowEvent.google.conv

    The conversation instance that contains the raw input sent by Dialogflow

