.. _deviceAddress:

Device Address Information Reference
====================================

When a customer enables your Alexa skill, your skill can obtain the customer's permission to use address data associated with the customer's Alexa device. You can then use this address data to provide key functionality for the skill, or to enhance the customer experience. For example, your skill could provide a list of nearby store locations or provide restaurant recommendations using this address information. This document describes how to enable this capability and query the Device Address API for address data.

Note that the address entered in the Alexa device may not represent the current physical address of the device. This API uses the address that the customer has entered manually in the Alexa app, and does not have any capability of testing for GPS or other location-based data.

.. js:function:: DeviceAddress.constructor(alexaEvent)

  Constructor

  :param alexaEvent: Alexa Event object.

.. js:function:: DeviceAddress.getAddress()

  Gets full address info

  :returns Object: A JSON object with the full address info

.. js:function:: DeviceAddress.getCountryRegionPostalCode()

  Gets country/region and postal code

  :returns Object: A JSON object with country/region info

With Voxa, you can ask for the full device's address like this:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('FullAddressIntent', async (alexaEvent) => {
    const info = await alexaEvent.deviceAddress.getAddress();

    alexaEvent.model.deviceInfo = `${info.addressLine1}, ${info.city}, ${info.countryCode}`;
    return { reply: 'DeviceAddress.FullAddress' };
  });

You can decide to only get the country/region and postal code. You can do it this way:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('PostalCodeIntent', async (alexaEvent) => {
    const info = await alexaEvent.deviceAddress.getCountryRegionPostalCode();

    alexaEvent.model.deviceInfo = `${info.postalCode}, ${info.countryCode}`;
    return { reply: 'DeviceAddress.PostalCode' };
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
