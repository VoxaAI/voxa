.. _alexa-apis:

==============================================
Alexa APIs
==============================================
Amazon has integrated several APIs so users can leverage the Alexa's configurations, device's and user's information.


.. _alexa-customer-contact:

--------------------------------------
Customer Contact Information Reference
--------------------------------------

When a customer enables your Alexa skill, your skill can request the customer's permission to the their contact information, which includes name, email address and phone number, if the customer has consented. You can then use this data to support personalized intents to enhance the customer experience without account linking. For example, your skill may use customer contact information to make a reservation at a nearby restaurant and send a confirmation to the customer.

.. js:class:: CustomerContact(alexaEvent)

  :param VoxaEvent.rawEvent alexaEvent: Alexa Event object.

  .. js:method:: getEmail()

    Gets user's email

    :returns string: A string with user's email address

  .. js:method:: getGivenName()

    Gets user's given name

    :returns string: A string with user's given name

  .. js:method:: getName()

    Gets user's full name

    :returns string: A string with user's full name

  .. js:method:: getPhoneNumber()

    Gets user's phone number

    :returns object: A JSON object with user's phone number and country code

  .. js:method:: getFullUserInformation()

    Gets name or given name, phone number, and email address

    :returns object: A JSON object with user's info with the following structure

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

  app.onIntent('FullAddressIntent', async (voxaEvent) => {
    const name = await voxaEvent.alexa.customerContact.getName();

    voxaEvent.model.name = name;
    return { ask: 'CustomerContact.Name' };
  });

Voxa also has a method to request all parameters at once:

.. code-block:: javascript

  app.onIntent('FullAddressIntent', async (voxaEvent) => {
    const info = await voxaEvent.alexa.customerContact.getFullUserInformation();
    const { countryCode, email, name, phoneNumber } = info;

    voxaEvent.model.countryCode = countryCode;
    voxaEvent.model.email = email;
    voxaEvent.model.name = name;
    voxaEvent.model.phoneNumber = phoneNumber;

    return { ask: 'CustomerContact.FullInfo' };
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


.. _alexa-device-address:

------------------------------------
Device Address Information Reference
------------------------------------

When a customer enables your Alexa skill, your skill can obtain the customer's permission to use address data associated with the customer's Alexa device. You can then use this address data to provide key functionality for the skill, or to enhance the customer experience. For example, your skill could provide a list of nearby store locations or provide restaurant recommendations using this address information. This document describes how to enable this capability and query the Device Address API for address data.

Note that the address entered in the Alexa device may not represent the current physical address of the device. This API uses the address that the customer has entered manually in the Alexa app, and does not have any capability of testing for GPS or other location-based data.

.. js:class:: DeviceAddress(alexaEvent)

  :param VoxaEvent.rawEvent alexaEvent: Alexa Event object.

  .. js:method:: getAddress()

    Gets full address info

    :returns object: A JSON object with the full address info

  .. js:method:: getCountryRegionPostalCode()

    Gets country/region and postal code

    :returns object: A JSON object with country/region info

With Voxa, you can ask for the full device's address like this:

.. code-block:: javascript

  app.onIntent('FullAddressIntent', async (voxaEvent) => {
    const info = await voxaEvent.alexa.deviceAddress.getAddress();

    voxaEvent.model.deviceInfo = `${info.addressLine1}, ${info.city}, ${info.countryCode}`;
    return { ask: 'DeviceAddress.FullAddress' };
  });

You can decide to only get the country/region and postal code. You can do it this way:

.. code-block:: javascript

  app.onIntent('PostalCodeIntent', async (voxaEvent) => {
    const info = await voxaEvent.alexa.deviceAddress.getCountryRegionPostalCode();

    voxaEvent.model.deviceInfo = `${info.postalCode}, ${info.countryCode}`;
    return { ask: 'DeviceAddress.PostalCode' };
  });

To send a card requesting user the permission to access the device address info, you can simply add the card object to the view in your `views.js` file with the following format:

.. code-block:: javascript

  FullAddressPermision: {
    tell: 'Before accessing your full address, you need to give me permission. Go to your Alexa app, I just sent a link.',
    card: {
      type: 'AskForPermissionsConsent',
      permissions: [
        'read::alexa:device:all:address',
      ],
    },
  },

  PostalCodePermission: {
    tell: 'Before accessing your postal code, you need to give me permission. Go to your Alexa app, I just sent a link.',
    card: {
      type: 'AskForPermissionsConsent',
      permissions: [
        'read::alexa:device:all:address:country_and_postal_code',
      ],
    },
  },


.. _alexa-device-settings:

-------------------------
Device Settings Reference
-------------------------

Alexa customers can set their timezone, distance measuring unit, and temperature measurement unit in the Alexa app. The Alexa Settings APIs allow developers to retrieve customer preferences for these settings in a unified view.

.. js:class:: DeviceSettings(voxaEvent)

  :param VoxaEvent.rawEvent alexaEvent: Alexa Event object.

  .. js:method:: getDistanceUnits()

    Gets distance units

    :returns string: A string with the distance units

  .. js:method:: getTemperatureUnits()

    Gets temperature units

    :returns string: A string with the temperature units

  .. js:method:: getTimezone()

    Gets timezone

    :returns string: A string with the timezone value

  .. js:method:: getSettings()

    Gets all settings details

    :returns object: A JSON object with device's info with the following structure

    .. code-block:: json

      {
        "distanceUnits": "string",
        "temperatureUnits": "string",
        "timezone": "string"
      }

With Voxa, you can ask for the full device's address like this:

.. code-block:: javascript

  app.onIntent('FullSettingsIntent', async (voxaEvent) => {
    const info = await voxaEvent.alexa.deviceSettings.getSettings();

    voxaEvent.model.settingsInfo = `${info.distanceUnits}, ${info.temperatureUnits}, ${info.timezone}`;
    return { ask: 'DeviceSettings.FullSettings' };
  });

You don't need to request to the user the permission to access the device settings info.

.. _alexa-isp:

----------------------------
In-Skill Purchases Reference
----------------------------

The `in-skill purchasing <https://developer.amazon.com/docs/in-skill-purchase/isp-overview.html>`_ feature enables you to sell premium content such as game features and interactive stories for use in skills with a custom interaction model.

Buying these products in a skill is seamless to a user. They may ask to shop products, buy products by name, or agree to purchase suggestions you make while they interact with a skill. Customers pay for products using the payment options associated with their Amazon account.

For more information about setting up ISP with the ASK CLI follow this `link <https://developer.amazon.com/docs/in-skill-purchase/use-the-cli-to-manage-in-skill-products.html>`_. And to understand what's the process behind the ISP requests and responses to the Alexa Service click `here <https://developer.amazon.com/docs/in-skill-purchase/add-isps-to-a-skill.html>`_.

With Voxa, you can implement all ISP features like buying, refunding and upselling an item:

.. code-block:: javascript

  app.onIntent('BuyIntent', async (voxaEvent) => {
    const { productName } = voxaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await voxaEvent.alexa.isp.buyByReferenceName(productName, token);

    return { alexaConnectionsSendRequest: buyDirective };
  });

  app.onIntent('RefundIntent', async (voxaEvent) => {
    const { productName } = voxaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await voxaEvent.alexa.isp.cancelByReferenceName(productName, token);

    return { alexaConnectionsSendRequest: buyDirective };
  });


You can also check if the ISP feature is allowed in a locale or the account is correctly setup in the markets ISP works just by checking with the `isAllowed()` function.

.. code-block:: javascript

  app.onIntent('UpsellIntent', async (voxaEvent) => {
    if (!voxaEvent.alexa.isp.isAllowed()) {
      return { ask: 'ISP.Invalid', to: 'entry' };
    }

    const { productName } = voxaEvent.intent.params;
    const token = 'startState';
    const buyDirective = await voxaEvent.alexa.isp.upsellByReferenceName(productName, upsellMessage, token);

    return { alexaConnectionsSendRequest: buyDirective };
  });


To get the full list of products and know which ones have been purchased, you can do it like this:

.. code-block:: javascript

  app.onIntent('ProductsIntent', async (voxaEvent) => {
    const list = await voxaEvent.alexa.isp.getProductList();

    voxaEvent.model.productArray = list.inSkillProducts.map(x => x.referenceName);

    return { ask: 'Products.List', to: 'entry' };
  });


When users accept or refuse to buy/cancel an item, Alexa sends a Connections.Response directive. A very simple example on how the Connections.Response JSON request from Alexa looks like is:

.. code-block:: json

  {
    "type": "Connections.Response",
    "requestId": "string",
    "timestamp": "string",
    "name": "Upsell",
    "status": {
      "code": "string",
      "message": "string"
    },
    "payload": {
      "purchaseResult": "ACCEPTED",
      "productId": "string",
      "message": "optional additional message"
    },
    "token": "string"
  }

.. _alexa-lists:

----------------------------------------
Alexa Shopping and To-Do Lists Reference
----------------------------------------

Alexa customers have access to two default lists: Alexa to-do and Alexa shopping. In addition, Alexa customer can create and manage `custom lists <https://developer.amazon.com/docs/custom-skills/access-the-alexa-shopping-and-to-do-lists.html>`_ in a skill that supports that.

Customers can review and modify their Alexa lists using voice through a device with Alexa or via the Alexa app. For example, a customer can tell Alexa to add items to the Alexa Shopping List at home, and then while at the store, view the items via the Alexa app, and check them off.

.. js:class:: Lists(alexaEvent)

  :param VoxaEvent.rawEvent alexaEvent: Alexa Raw Event object.

  .. js:method:: getDefaultShoppingList()

    Gets info for the Alexa default Shopping list

    :returns Object: A JSON object with the Shopping list info

  .. js:method:: getDefaultToDoList()

    Gets info for the Alexa default To-Do list

    :returns Object: A JSON object with the To-Do list info

  .. js:method:: getListMetadata()

    Gets list metadata for all user's lists including the default list

    :returns Array: An object array

  .. js:method:: getListById(listId, status = 'active')

    Gets specific list by id and status

    :param listId: List ID.
    :param status: list status, defaults to active (only value accepted for now)
    :returns Object: A JSON object with the specific list info.

  .. js:method:: getOrCreateList(name)

    Looks for a list by name and returns it, if it is not found, it creates a new list with that name and returns it.

    :param name: List name.
    :returns Object: A JSON object with the specific list info.

  .. js:method:: createList(name, state = 'active')

    Creates a new list with the name and state.

    :param name: List name.
    :param active: list status, defaults to active (only value accepted for now)
    :returns Object: A JSON object with the specific list info.

  .. js:method:: updateList(listId, name, state = 'active', version)

    Updates list with the name, state, and version.

    :param listId: List ID.
    :param state: list status, defaults to active (only value accepted for now)
    :param version: List version.
    :returns Object: A JSON object with the specific list info.

  .. js:method:: deleteList(listId)

    Deletes a list by ID.

    :param listId: List ID.
    :returns: undefined. HTTP response with 200 or error if any.

  .. js:method:: getListItem(listId, itemId)

    Creates a new list with the name and state.

    :param listId: List ID.
    :param itemId: Item ID.
    :returns Object: A JSON object with the specific list info.

  .. js:method:: createItem(listId, value, status = 'active')

    Creates a new list with the name and state.

    :param listId: List ID.
    :param value: Item name.
    :param status: item status, defaults to active. Other values accepted: 'completed'
    :returns Object: A JSON object with the specific item info.

  .. js:method:: updateItem(listId, itemId, value, status, version)

    Creates a new list with the name and state.

    :param listId: List ID.
    :param itemId: Item ID.
    :param value: Item name.
    :param status: Item status. Values accepted: 'active | completed'
    :returns Object: A JSON object with the specific item info.

  .. js:method:: deleteItem(listId, itemId)

    Creates a new list with the name and state.

    :param listId: List ID.
    :param itemId: Item ID.
    :returns: undefined. HTTP response with 200 or error if any.

With Voxa, you can implement all lists features. In this code snippet you will see how to check if a list exists, if not, it creates one. If it does exist, it will check if an item is already in the list and updates the list with a new version, if no, it adds it:

.. code-block:: javascript

  app.onIntent('AddItemToListIntent', async (voxaEvent) => {
    const { productName } = voxaEvent.intent.params;
    const listsMetadata = await voxaEvent.alexa.lists.getListMetadata();
    const listName = 'MY_CUSTOM_LIST';

    const listMeta = _.find(listsMetadata.lists, { name: listName });
    let itemInfo;
    let listInfo;

    if (listMeta) {
      listInfo = await voxaEvent.alexa.lists.getListById(listMeta.listId);
      itemInfo = _.find(listInfo.items, { value: productName });

      await voxaEvent.alexa.lists.updateList(listMeta.name, 'active', 2);
    } else {
      listInfo = await voxaEvent.alexa.lists.createList(listName);
    }

    if (itemInfo) {
      return { ask: 'List.ProductAlreadyInList' };
    }

    await voxaEvent.alexa.lists.createItem(listInfo.listId, productName);

    return { ask: 'List.ProductCreated' };
  });

There's also a faster way to consult and/or create a list. Follow this example:

.. code-block:: javascript

  app.onIntent('AddItemToListIntent', async (voxaEvent) => {
    const { productName } = voxaEvent.intent.params;
    const listName = 'MY_CUSTOM_LIST';

    const listInfo = await voxaEvent.alexa.lists.getOrCreateList(listName);
    const itemInfo = _.find(listInfo.items, { value: productName });

    if (itemInfo) {
      return { ask: 'List.ProductAlreadyInList' };
    }

    await voxaEvent.alexa.lists.createItem(listInfo.listId, productName);

    return { ask: 'List.ProductCreated' };
  });


Let's review another example. Let's say we have an activity in the default To-Do list and we want to mark it as completed. For that, we need to pull down the items from the default To-Do list, find our item and modify it:

.. code-block:: javascript

  app.onIntent('CompleteActivityIntent', async (voxaEvent) => {
    const { activity } = voxaEvent.intent.params;

    const listInfo = await voxaEvent.alexa.lists.getDefaultToDoList();
    const itemInfo = _.find(listInfo.items, { value: activity });

    await voxaEvent.alexa.lists.updateItem(
      listInfo.listId,
      itemInfo.id,
      activity,
      'completed',
      2);

    return { ask: 'List.ActivityCompleted' };
  });

Let's check another example. Let's say users want to remove an item in their default shopping list that they had already marked as completed. We're going to first fetch the default shopping list's info, then look for the product to remove, we're going to first check if the product is marked as completed to then delete it:

.. code-block:: javascript

  app.onIntent('RemoveProductIntent', async (voxaEvent) => {
    const { productId } = voxaEvent.model;

    const listInfo = await voxaEvent.alexa.lists.getDefaultShoppingList();
    const itemInfo = await voxaEvent.alexa.lists.getListItem(listInfo.listId, productId);

    if (itemInfo.status === 'active') {
      return { ask: 'List.ConfirmProductDeletion', to: 'wantToDeleteActiveProduct?' };
    }

    await voxaEvent.alexa.lists.deleteItem(listInfo.listId, productId);

    return { ask: 'List.ProductRemoved' };
  });

Finally, if you want to remove the list you had created:

.. code-block:: javascript

  app.onIntent('DeleteListIntent', async (voxaEvent) => {
    const listName = 'MY_CUSTOM_LIST';

    const listInfo = await voxaEvent.alexa.lists.getOrCreateList(listName);
    await voxaEvent.alexa.lists.deleteList(listInfo.listId);

    return { ask: 'List.ListRemoved' };
  });

To send a card requesting user the permission to read/write Alexa lists, you can simply add the card object to the view in your `views.js` file with the following format:

.. code-block:: javascript

  NeedShoppingListPermission: {
    tell: 'Before adding an item to your list, you need to give me permission. Go to your Alexa app, I just sent a link.',
    card: {
      type: 'AskForPermissionsConsent',
      permissions: [
        'read::alexa:household:list',
        'write::alexa:household:list',
      ],
    },
  },


.. _alexa-reminders:

-----------------------------
Alexa Reminders API Reference
-----------------------------

Use the Alexa Reminders API to create and manage reminders from your skill. This reference describes the available operations for the Alexa Reminders API.

Note that you need to modify your skill manifest by adding the reminder permission:

.. code-block:: json
  ...
  "permissions": [
    {
      "name": "alexa::alerts:reminders:skill:readwrite"
    }
  ],
  ...

.. js:class:: Reminders(alexaEvent)

  :param VoxaEvent.rawEvent alexaEvent: Alexa Event object.

  .. js:method:: getReminder()

    Gets a reminder

    :param alertToken: Reminder's ID.

    :returns object: A JSON object with the reminder's details

  .. js:method:: getAllReminders()

    Gets all reminders

    :returns object: A JSON object with an array of the reminder's details

  .. js:method:: createReminder(reminder)

    Creates a reminder

    :param reminder: Reminder Builder Object.

    :returns object: A JSON object with the details of reminder's creation

  .. js:method:: updateReminder(alertToken, reminder)

    Updates a reminder

    :param alertToken: Reminder's ID.
    :param reminder: Reminder Builder Object.

    :returns object: A JSON object with the details of reminder's update

  .. js:method:: deleteReminder(alertToken)

    Deletes a reminder

    :param alertToken: Reminder's ID.

    :returns object: A JSON object with the details of reminder's deletion

.. js:class:: ReminderBuilder()

  .. js:method:: setCreatedTime(createdTime)

    Sets created time

    :param createdTime: Reminder's creation time.

    :returns object: A ReminderBuilder object

  .. js:method:: setRequestTime(requestTime)

    Sets request time

    :param requestTime: Reminder's request time.

    :returns object: A ReminderBuilder object

  .. js:method:: setTriggerAbsolute(scheduledTime)

    Sets the reminder trigger as absolute

    :param scheduledTime: Reminder's scheduled time.

    :returns object: A ReminderBuilder object

  .. js:method:: setTriggerRelative(offsetInSeconds)

    Sets the reminder trigger as relative

    :param offsetInSeconds: Reminder's offset in seconds.

    :returns object: A ReminderBuilder object

  .. js:method:: setTimeZoneId(timeZoneId)

    Sets time zone Id

    :param timeZoneId: Reminder's time zone.

    :returns object: A ReminderBuilder object

  .. js:method:: setRecurrenceFreqDaily()

    Sets reminder's recurrence frequence to "DAILY"

    :returns object: A ReminderBuilder object

  .. js:method:: setRecurrenceFreqWeekly()

    Sets reminder's recurrence frequence to "WEEKLY"

    :returns object: A ReminderBuilder object

  .. js:method:: setRecurrenceByDay(recurrenceByDay)

    Sets frequency by day

    :param recurrenceByDay: Array of frequency by day.

    :returns object: A ReminderBuilder object

  .. js:method:: setRecurrenceInterval(interval)

    Sets reminder's interval

    :param interval: Reminder's interval

    :returns object: A ReminderBuilder object

  .. js:method:: addContent(locale, text)

    Sets reminder's content

    :param locale: Reminder's locale
    :param text: Reminder's text

    :returns object: A ReminderBuilder object

  .. js:method:: enablePushNotification()

    Sets reminder's push notification status to "ENABLED"

    :returns object: A ReminderBuilder object

  .. js:method:: disablePushNotification()

    Sets reminder's push notification status to "DISABLED"

    :returns object: A ReminderBuilder object

With Voxa, you can create, update, delete and get reminders like this:

.. code-block:: javascript

  const { ReminderBuilder } = require("voxa");

  app.onIntent('CreateReminderIntent', async (voxaEvent) => {
    const reminder = new ReminderBuilder()
      .setCreatedTime("2018-12-11T14:05:38.811")
      .setTriggerAbsolute("2018-12-12T12:00:00.000")
      .setTimeZoneId("America/Denver")
      .setRecurrenceFreqDaily()
      .addContent("en-US", "CREATION REMINDER TEST")
      .enablePushNotification();

    const reminderResponse = await voxaEvent.alexa.reminders.createReminder(reminder);

    voxaEvent.model.reminder = reminderResponse;
    return { tell: "Reminder.Created" };
  });

  app.onIntent('UpdateReminderIntent', async (voxaEvent) => {
    const alertToken = '1234-5678-9012-3456';
    const reminder = new ReminderBuilder()
      .setRequestTime("2018-12-11T14:05:38.811")
      .setTriggerAbsolute("2018-12-12T12:00:00.000")
      .setTimeZoneId("America/Denver")
      .setRecurrenceFreqDaily()
      .addContent("en-US", "CREATION REMINDER TEST")
      .enablePushNotification();

    const reminderResponse = await voxaEvent.alexa.reminders.updateReminder(alertToken, reminder);

    voxaEvent.model.reminder = reminderResponse;
    return { tell: "Reminder.Updated" };
  });

  app.onIntent('UpdateReminderIntent', async (voxaEvent) => {
    const alertToken = '1234-5678-9012-3456';
    const reminderResponse = await voxaEvent.alexa.reminders.deleteReminder(alertToken);

    return { tell: "Reminder.Deleted" };
  });

  app.onIntent('GetReminderIntent', async (voxaEvent) => {
    const alertToken = '1234-5678-9012-3456';
    const reminderResponse = await voxaEvent.alexa.reminders.getReminder(alertToken);

    voxaEvent.model.reminder = reminderResponse.alerts[0];
    return { tell: "Reminder.Get" };
  });

  app.onIntent('GetAllRemindersIntent', async (voxaEvent) => {
    const reminderResponse = await voxaEvent.alexa.reminders.getAllReminders();

    voxaEvent.model.reminders = reminderResponse.alerts;
    return { tell: "Reminder.Get" };
  });


.. _alexa-messaging:

-----------------------------
Skill Messaging API Reference
-----------------------------

The Skill Messaging API is used to send message requests to skills. These methods are meant to work for out-of-session operations, so you will not likely use it in the skill code. However, you might have a separate file inside your Voxa project to work with some automated triggers like CloudWatch Events or SQS functions. In that case, your file has access to the voxa package, thus, you can take advantage of these methods.

.. js:class:: Messaging()

  .. js:method:: getAuthToken()

    Gets new access token

    :param clientId: Client ID to call Messaging API.
    :param clientSecret: Client Secret to call Messaging API.

    :returns object: A JSON object with token information with the following structure

    .. code-block:: json

      {
        "access_token":"Atc|MQEWYJxEnP3I1ND03ZzbY_NxQkA7Kn7Aioev_OfMRcyVQ4NxGzJMEaKJ8f0lSOiV-yW270o6fnkI",
        "expires_in":3600,
        "scope":"alexa:skill_messaging",
        "token_type":"Bearer"
      }

  .. js:method:: sendMessage()

    Sends message to a skill

    :param request: Message request params with the following structure:

  .. code-block:: javascript

    {
      endpoint: string, // User's endpoint.
      userId: string, // User's userId.
      data: any, // Object with key-value pairs to send to the skill.
      skillMessagingToken: string, // User's accessToken.
      expiresAfterSeconds: number, // Expiration time in milliseconds, defaults to 3600 milliseconds.
    }

    :returns: undefined

In the following example, you'll see a simple code of a lambda function which calls your database to fetch users to whom you'll send a message with the Messaging API:

.. code-block:: javascript

  'use strict';

  const Promise = require('bluebird');
  const { Messaging } = require('voxa');

  const Storage = require('./Storage');

  const CLIENT_ID = 'CLIENT_ID';
  const CLIENT_SECRET = 'CLIENT_SECRET';

  exports.handler = async (event, context, callback) => {
    const usersOptedIn = await Storage.getUsers();

    await Promise.map(usersOptedIn, (user) => {
      return Messaging.getAuthToken(CLIENT_ID, CLIENT_SECRET)
        .then((result) => {
          const request = {
            endpoint: user.endpoint,
            userId: user.userId,
            data: user.dataToSend,
            skillMessagingToken: result.access_token,
          };

          return Messaging.sendMessage(request);
        })
        .catch((err) => {
          console.log('ERROR SENDING MESSAGE', err);

          return null;
        });
    });

    callback(undefined, "OK");
  };

This will dispatch a 'Messaging.MessageReceived' request to every user and you can handle the code in Voxa like this:

.. code-block:: javascript

  app.onIntent('Messaging.MessageReceived', (voxaEvent) => {
    const dataReceived = voxaEvent.rawEvent.request.message;

    // DO SOMETHING WITH THE DATA RECEIVED AND RESPOND TO THE REQUEST

    return { to: "die" };
  });

The request object looks like this:

.. code-block:: json

  "request": {
    "type": "Messaging.MessageReceived",
    "requestId": "amzn1.echo-api.request.VOID",
    "timestamp": "2018-12-17T22:06:28Z",
    "message": {
      "name": "John"
    }
  }
