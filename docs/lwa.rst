.. _lwa:

LoginWithAmazon
===============

With LoginWithAmazon, you can request a customer profile that contains the data that Login with Amazon applications can access regarding a particular customer. This includes: a unique ID for the user; the user's name, the user's email address, and their postal code. This data is divided into three scopes: profile, profile:user_id and postal_code.

LoginWithAmazon works a seamless solution to get user's information using account linking via web browser. To see more information about it, follow this `link <https://developer.amazon.com/docs/login-with-amazon/customer-profile.html>`_. To implement LoginWithAmazon in your Alexa skill, follow this step-by-step `tutorial <https://developer.amazon.com/blogs/post/Tx3CX1ETRZZ2NPC/Alexa-Account-Linking-5-Steps-to-Seamlessly-Link-Your-Alexa-Skill-with-Login-wit>`_. You can also do account linking via voice. Go :ref:`here <customerContact>` to check it out!

.. js:function:: LWA.constructor(alexaEvent)

  Constructor

  :param alexaEvent: Alexa Event object.

.. js:function:: LWA.getUserInformation()

  Gets user's name, email address and zipCode, depending on the scopes selected

.. code-block:: json

  {
    "user_id": "amzn1.account.K2LI23KL2LK2",
    "email": "johndoe@gmail.com",
    "name": "John Doe",
    "postal_code": "98101"
  }

With Voxa, you can ask for the user's full name like this:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('ProfileIntent', async (alexaEvent) => {
    const userInfo = await alexaEvent.lwa.getUserInformation();

    alexaEvent.model.email = userInfo.email;
    alexaEvent.model.name = userInfo.name;
    alexaEvent.model.zipCode = userInfo.postal_code;
    return { reply: 'UserInformation.Name' };
  });

To send a card requesting user the permission to access their information, you can simply add the card object to the view in your `views.js` file with the following format:

.. code-block:: javascript

  LinkAccount: {
    tell: 'Before accessing your information, you need to give me permission. Go to your Alexa app, I just sent a link.',
    card: {
      type: 'LinkAccount',
    },
  },
