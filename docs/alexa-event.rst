.. _alexa-event:

The ``AlexaEvent`` Object
===========================

.. js:class:: AlexaEvent(event, lambdaContext)

  The ``alexaEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.


  .. js:attribute:: AlexaEvent.token

    A convenience getter to obtain the request's token, specially when using the ``Display.ElementSelected``

  .. js:attribute:: AlexaEvent.alexa.customerContact


    When a customer enables your Alexa skill, your skill can request the customer's permission to the their contact information, see :ref:`alexa-customer-contact`.

  .. js:attribute:: AlexaEvent.alexa.deviceAddress

    When a customer enables your Alexa skill, your skill can obtain the customer's permission to use address data associated with the customer's Alexa device, see :ref:`alexa-device-address`.

  .. js:attribute:: AlexaEvent.alexa.deviceSettings

    Alexa customers can set their timezone, distance measuring unit, and temperature measurement unit in the Alexa app, see :ref:`alexa-device-settings`.

  .. js:attribute:: AlexaEvent.alexa.isp

    The `in-skill purchasing <https://developer.amazon.com/docs/in-skill-purchase/isp-overview.html>`_ feature enables you to sell premium content such as game features and interactive stories for use in skills with a custom interaction model, see :ref:`alexa-isp`.

  .. js:attribute:: AlexaEvent.alexa.lists

    Alexa customers have access to two default lists: Alexa to-do and Alexa shopping. In addition, Alexa customer can create and manage `custom lists <https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html>`_ in a skill that supports that, see :ref:`alexa-lists`.
