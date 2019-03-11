.. _dialogflow-events:

.. _googleassistant-event:

The ``GoogleAssistantEvent`` Object
===================================

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

  The ``facebookEvent`` object also gives you the necessary helpers to implement the Handover Protocol, very useful when you want to pass the conversation from your bot to a live person, the most common example is when user sends to your bot the following text: I want to talk to a representative. This means your bot is not understanding what user is saying or the bot can't give to the user what they are looking for. So, it's necessary a person to talk directly to the user. You can pass the control to your Page Inbox like this:

.. code-block:: javascript

  const { FacebookEvent, FacebookPlatform, VoxaApp } = require('voxa');

  const config = {
    pageAccessToken: 'EAAaKuJF183EBAApxv.........',
  };
  const app = new VoxaApp({ views, variables });
  const facebookBot = new FacebookPlatform(app, config);

  app.onIntent("PassControlIntent", async (voxaEvent: FacebookEvent) => {
    await voxaEvent.facebook.passThreadControlToPageInbox();

    return {
      flow: "terminate",
      text: "Facebook.RepresentativeWillGetInTouch.text",
      to: "die",
    };
  });

  Also, if the app you are working on is not the Primary Receiver, you can request control of the conversation like this:

.. code-block:: javascript

  const { FacebookEvent, FacebookPlatform, VoxaApp } = require('voxa');

  const config = {
    pageAccessToken: 'EAAaKuJF183EBAApxv.........',
  };
  const app = new VoxaApp({ views, variables });
  const facebookBot = new FacebookPlatform(app, config);

  app.onIntent("CustomIntent", async (voxaEvent: FacebookEvent) => {
    await voxaEvent.facebook.requestThreadControl();

    return {
      flow: "terminate",
      text: "Facebook.ControlRequested.text",
      to: "die",
    };
  });

  Finally, if you detect the secondary receiver is not responding to the user, you can make your bot (Primary Receiver) take the control of the conversation like this:

.. code-block:: javascript

  const { FacebookEvent, FacebookPlatform, VoxaApp } = require('voxa');

  const config = {
    pageAccessToken: 'EAAaKuJF183EBAApxv.........',
  };
  const app = new VoxaApp({ views, variables });
  const facebookBot = new FacebookPlatform(app, config);

  app.onIntent("CustomIntent", async (voxaEvent: FacebookEvent) => {
    await voxaEvent.facebook.takeThreadControl();

    return {
      flow: "terminate",
      text: "Facebook.ControlTaken.text",
      to: "die",
    };
  });
