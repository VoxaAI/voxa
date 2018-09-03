.. _deviceSettings:

Device Settings Reference
=========================

Alexa customers can set their timezone, distance measuring unit, and temperature measurement unit in the Alexa app. The Alexa Settings APIs allow developers to retrieve customer preferences for these settings in a unified view.

.. js:function:: DeviceSettings.constructor(alexaEvent)

  Constructor

  :param alexaEvent: Alexa Event object.

.. js:function:: DeviceSettings.getDistanceUnits()

  Gets distance units

  :returns Object: A string with the distance units

.. js:function:: DeviceSettings.getTemperatureUnits()

  Gets temperature units

  :returns Object: A string with the temperature units

.. js:function:: DeviceSettings.getTimezone()

  Gets timezone

  :returns Object: A string with the timezone value

.. js:function:: DeviceSettings.getSettings()

  Gets all settings details

  :returns Object: A JSON object with device's info with the following structure

.. code-block:: json

  {
    "distanceUnits": "string",
    "temperatureUnits": "string",
    "timezone": "string"
  }

With Voxa, you can ask for the full device's address like this:

.. code-block:: javascript

  const skill = new Voxa({ variables, views });

  skill.onIntent('FullSettingsIntent', async (alexaEvent) => {
    const info = await alexaEvent.deviceSettings.getSettings();

    alexaEvent.model.settingsInfo = `${info.distanceUnits}, ${info.temperatureUnits}, ${info.timezone}`;
    return { reply: 'DeviceSettings.FullSettings' };
  });

You don't need to request to the user the permission to access the device settings info.
