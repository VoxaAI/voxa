.. _voxa-event:

The ``voxaEvent`` Object
===========================

.. js:class:: VoxaEvent(event, context)

  The ``voxaEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: rawEvent

    A plain javascript copy of the request object as received from the platform

  .. js:attribute:: executionContext

    On AWS Lambda this object contains the context

  .. js:attribute:: t

    The current translation function from i18next, initialized to the language of the current request

  .. js:attribute:: renderer

    The renderer object used in the current request

  .. js:attribute:: platform

    The currently running :ref:`Voxa Platform <voxa-platforms>`

  .. js:attribute:: model

    The default middleware instantiates a ``Model`` and makes it available through ``voxaEvent.model``

  .. js:attribute:: intent.params

    In Alexa the voxaEvent object makes ``intent.slots`` available through ``intent.params`` after aplying a simple transformation so


    .. code-block:: json

          { "slots": [{ "name": "Dish", "value": "Fried Chicken" }] }
    ..

    becomes:

    .. code-block:: json

        { "Dish": "Fried Chicken" }
    ..

    in other platforms it does it's best to make the intent params for each platform also available on ``intent.params``

  .. js:attribute:: user

    An object that contains the userId and accessToken if available

    .. code-block:: json

          {
            "userId": "The platform specific userId",
            "id": "same as userId",
            "accessToken": "available if user has done account linking"
          }
    ..

  .. js:attribute:: model

    An instance of the :ref:`Voxa App Model <models>`.

  .. js:attribute:: log

    An instance of `lambda-log <https://www.npmjs.com/package/lambda-log>`_

  .. js:function:: supportedInterfaces()

    Array of supported interfaces

    :returns Array: A string array of the platform's supported interfaces

  .. js:function:: getUserInformation()

    Object with user personal information from the platform being used.

    .. code-block:: json

          {
            // Google specific fields
            "sub": 1234567890,        // The unique ID of the user's Google Account
            "iss": "https://accounts.google.com",        // The token's issuer
            "aud": "123-abc.apps.googleusercontent.com", // Client ID assigned to your Actions project
            "iat": 233366400,         // Unix timestamp of the token's creation time
            "exp": 233370000,         // Unix timestamp of the token's expiration time
            "emailVerified": true,
            "givenName": "John",
            "familyName": "Doe",
            "locale": "en_US",

            // Alexa specific fields
            "zipCode": "98101",
            "userId": "amzn1.account.K2LI23KL2LK2",

            // Platforms common fields
            "email": "johndoe@gmail.com",
            "name": "John Doe"
          }
    ..

    :returns object: A object with user's information

  .. js:function:: getUserInformationWithGoogle()

    Object with user personal information from Google. Go :ref:`here <google-sign-in>` for more information.

    .. code-block:: json

          {
            "sub": 1234567890,        // The unique ID of the user's Google Account
            "iss": "https://accounts.google.com",        // The token's issuer
            "aud": "123-abc.apps.googleusercontent.com", // Client ID assigned to your Actions project
            "iat": 233366400,         // Unix timestamp of the token's creation time
            "exp": 233370000,         // Unix timestamp of the token's expiration time
            "givenName": "John",
            "familyName": "Doe",
            "locale": "en_US",
            "email": "johndoe@gmail.com",
            "name": "John Doe"
          }
    ..

    :returns object: A object with user's information

  .. js:function:: getUserInformationWithLWA()

    Object with user personal information from Amazon. Go :ref:`here <lwa>` for more information.

    .. code-block:: json

          {
            "email": "johndoe@gmail.com",
            "name": "John Doe",
            "zipCode": "98101",
            "userId": "amzn1.account.K2LI23KL2LK2"
          }
    ..

    :returns object: A object with user's information

``IVoxaEvent`` is an interface that inherits its attributes and function to the specific platforms, for more information about each platform's own methods visit:

- :ref:`AlexaEvent <alexa-event>`
- :ref:`BotFrameworkEvent <botframework-event>`
- :ref:`DialogFlowEvent <dialogflow-event>`
