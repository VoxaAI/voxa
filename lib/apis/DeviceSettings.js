'use strict';

const DeviceBase = require('./DeviceBase');

class DeviceSettings extends DeviceBase {
  constructor(alexaEvent) {
    super(alexaEvent);

    this.tag = 'DeviceSettings';
    this.errorCodeSafeToIgnore = 204;
  }

  /*
   * Gets distance unit associated to device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-distance-measurement-unit
   */
  getDistanceUnits() {
    return this.getResult(`v2/devices/${this.deviceId}/settings/System.distanceUnits`)
      .catch(err => this.checkError(err));
  }

  /*
   * Gets temperature unit associated to device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-temperature-measurement-unit
   */
  getTemperatureUnits() {
    return this.getResult(`v2/devices/${this.deviceId}/settings/System.temperatureUnits`)
      .catch(err => this.checkError(err));
  }

  /*
   * Gets the timezone specified in device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-timezone
   */
  getTimezone() {
    return this.getResult(`v2/devices/${this.deviceId}/settings/System.timeZone`)
      .catch(err => this.checkError(err));
  }

  /*
   * Gets timezone, distance and temperature units associated
   * to device settings in a single object
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html
   */
  async getSettings() {
    const infoRequests = [
      this.getDistanceUnits(),
      this.getTemperatureUnits(),
      this.getTimezone(),
    ];

    const [distanceUnits, temperatureUnits, timezone] = await Promise.all(infoRequests);

    return {
      distanceUnits,
      temperatureUnits,
      timezone,
    };
  }
}

module.exports = DeviceSettings;
