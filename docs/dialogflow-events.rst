.. _dialogflow-events:

.. _googleassistant-event:

The ``GoogleAssistantEvent`` Object
==============================

.. js:class:: GoogleAssistantEvent(event, lambdaContext)

  The ``googleAssistantEvent`` object contains all the information from the Voxa event, it's an object kept for the entire lifecycle of the state machine transitions and as such is a perfect place for middleware to put information that should be available on every request.

  .. js:attribute:: GoogleAssistantEvent.google.conv

    The conversation instance that contains the raw input sent by Dialogflow

.. _facebook-event:

The ``FacebookEvent`` Object
==============================

.. js:class:: FacebookEvent(event, lambdaContext)

  The ``facebookEvent`` object contains all the information from the Voxa event for the Facebook Messenger platform, just like Google Assistant events. Additionally you can access the `facebook` property to send `Actions <https://developers.facebook.com/docs/messenger-platform/send-messages/sender-actions>`_ to the Chatbot conversation:

.. code-block:: javascript

  const { FacebookEvent, FacebookPlatform, VoxaApp } = require('voxa');

  const config = {
    pageAccessToken: 'EAAaKuJF183EBAApxv.........',
  };
  const app = new VoxaApp({ views, variables });
  const facebookBot = new FacebookPlatform(app, config);

  app.onIntent("LaunchIntent", async (voxaEvent: FacebookEvent) => {
    await voxaEvent.facebook.sendTypingOffAction();
    await voxaEvent.facebook.sendMarkSeenAction();
    await voxaEvent.facebook.sendTypingOnAction();

    const info = await voxaEvent.getUserInformation(FACEBOOK_USER_FIELDS.ALL);

    voxaEvent.model.info = info;
    return {
      flow: "terminate",
      text: "Facebook.User.FullInfo",
      to: "die",
    };
  });

  const reply = await facebookBot.execute(event);

You need to pass a configuration object with the `pageAccessToken` property that takes the accessToken of your Facebook page. Voxa will then use this object along with the sender userId to send this action to the messenger chat windows. The window will automatically put the SEEN label on the right bottom of the message sent by the user and will show the typing bubble until the response is sent back from your backend to Facebook or if you send the TypingOff action.
