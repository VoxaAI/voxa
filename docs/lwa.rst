.. _lwa:

LoginWithAmazon
===============

With LoginWithAmazon, you can request a customer profile that contains the data that Login with Amazon applications can access regarding a particular customer. This includes: a unique ID for the user; the user's name, the user's email address, and their postal code. This data is divided into three scopes: profile, profile:user_id and postal_code.

LoginWithAmazon works a seamless solution to get user's information using account linking via web browser. To see more information about it, follow this `link <https://developer.amazon.com/docs/login-with-amazon/customer-profile.html>`_. To implement LoginWithAmazon in your Alexa skill, follow this step-by-step `tutorial <https://developer.amazon.com/blogs/post/Tx3CX1ETRZZ2NPC/Alexa-Account-Linking-5-Steps-to-Seamlessly-Link-Your-Alexa-Skill-with-Login-wit>`_. You can also do account linking via voice. Go :ref:`here <alexa-apis>` to check it out!

With Voxa, you can ask for the user's full name like this:

.. code-block:: javascript

  app.onIntent('ProfileIntent', async (alexaEvent: AlexaEvent) => {
    const userInfo = await alexaEvent.getUserInformation();

    alexaEvent.model.email = userInfo.email;
    alexaEvent.model.name = userInfo.name;
    alexaEvent.model.zipCode = userInfo.zipCode;

    return { ask: 'CustomerContact.FullInfo' };
  });

In this case, Voxa will detect you're running an Alexa Skill, so, it will call the `getUserInformationWithLWA()` method. But you can also call it directly. Even if you create voice experiences in other platforms like Google or Cortana, you can take advantage of the methods for authenticating with other platforms.
