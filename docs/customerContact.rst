.. _customerContact:

Customer Contact Information Reference
======================================

When a customer enables your Alexa skill, your skill can request the customer's permission to the their contact information, which includes name, email address and phone number, if the customer has consented. You can then use this data to support personalized intents to enhance the customer experience without account linking. For example, your skill may use customer contact information to make a reservation at a nearby restaurant and send a confirmation to the customer.

.. js:function:: CustomerContact.constructor(alexaEvent)

  Constructor

  :param alexaEvent: Alexa Event object.

.. js:function:: CustomerContact.getEmail()

  Gets user's email

  :returns Object: A string with user's email address

.. js:function:: CustomerContact.getGivenName()

  Gets user's given name

  :returns Object: A string with user's given name

.. js:function:: CustomerContact.getName()

  Gets user's full name

  :returns Object: A string with user's full name

.. js:function:: CustomerContact.getPhoneNumber()

  Gets user's phone number

  :returns Object: A JSON object with user's phone number and country code

.. js:function:: CustomerContact.getFullUserInformation()

  Gets name or given name, phone number, and email address

  :returns Object: A JSON object with user's info with the following structure

.. code-block:: json

  {
    "countryCode": "string",
    "email": "string",
    "givenName": "string",
    "name": "string",
    "phoneNumber": "string"
  }

With Voxa, you can ask for the user's full name like this:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('FullAddressIntent', async (alexaEvent) => {
    const name = await alexaEvent.customerContact.getName();

    alexaEvent.model.name = name;
    return { reply: 'CustomerContact.Name' };
  });

Voxa also has a method to request all parameters at once:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('FullAddressIntent', async (alexaEvent) => {
    const info = await alexaEvent.customerContact.getFullUserInformation();
    const { countryCode, email, name, phoneNumber } = info;

    alexaEvent.model.countryCode = countryCode;
    alexaEvent.model.email = email;
    alexaEvent.model.name = name;
    alexaEvent.model.phoneNumber = phoneNumber;

    return { reply: 'CustomerContact.FullInfo' };
  });

To send a card requesting user the permission to access their information, you can simply add the card object to the view in your `views.js` file with the following format:

.. code-block:: javascript

  ContactPermission: {
    tell: 'Before accessing your information, you need to give me permission. Go to your Alexa app, I just sent a link.',
    card: {
      type: 'AskForPermissionsConsent',
      permissions: [
        'alexa::profile:name:read',
        'alexa::profile:email:read',
        'alexa::profile:mobile_number:read'
      ],
    },
  },
