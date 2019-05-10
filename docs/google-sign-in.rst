.. _google-sign-in:

Google Sign-In
==============

Google Sign-In for the Assistant provides the simplest and easiest user experience to users and developers both for account linking and account creation. Your Action can request access to your user's Google profile during a conversation, including the user's name, email address, and profile picture.

The profile information can be used to create a personalized user experience in your Action. If you have apps on other platforms and they use Google Sign-In, you can also find and link to an existing user's account, create a new account, and establish a direct channel of communication to the user.

To perform account linking with Google Sign-In, you ask the user to give consent to access their Google profile. You then use the information in their profile, for example their email address, to identify the user in your system. Check out this `link <https://developers.google.com/actions/identity/google-sign-in>`_ for more information.

With Voxa, you can ask for the user's full name like this:

.. code-block:: javascript

  app.onIntent('ProfileIntent', async (googleAssistantEvent: GoogleAssistantEvent) => {
    const userInfo = await googleAssistantEvent.getUserInformation();

    googleAssistantEvent.model.email = userInfo.email;
    googleAssistantEvent.model.familyName = userInfo.familyName;
    googleAssistantEvent.model.givenName = userInfo.givenName;
    googleAssistantEvent.model.name = userInfo.name;
    googleAssistantEvent.model.locale = userInfo.locale;

    return { ask: 'CustomerContact.FullInfo' };
  });

In this case, Voxa will detect you're running a Google Action, so, it will call the `getUserInformationWithGoogle()` method. Since this is a Google-only API, you can't use this method on other platforms for the moment.
