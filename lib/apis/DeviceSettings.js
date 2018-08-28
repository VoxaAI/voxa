'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');
const rp = require('request-promise');

class DeviceSettings {
  constructor(alexaEvent) {
    this.apiAccessToken = _.get(alexaEvent, 'context.System.apiAccessToken');
    this.apiEndpoint = _.get(alexaEvent, 'context.System.apiEndpoint');
    this.deviceId = _.get(alexaEvent, 'context.System.device.deviceId');
  }

  /*
   * Calls the Alexa's Device Settings API
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html
   */
  getOptions(path = '') {
    return {
      uri: `${this.apiEndpoint}/${path}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.apiAccessToken}`,
      },
      json: true, // Automatically parses the JSON string in the response
    };
  }

  /*
   * Gets distance unit associated to device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-distance-measurement-unit
   */
  getDistanceUnits() {
    return rp(this.getOptions(`v2/devices/${this.deviceId}/settings/System.distanceUnits`))
      .catch(checkError);
  }

  /*
   * Gets temperature unit associated to device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-temperature-measurement-unit
   */
  getTemperatureUnits() {
    return rp(this.getOptions(`v2/devices/${this.deviceId}/settings/System.temperatureUnits`))
      .catch(checkError);
  }

  /*
   * Gets the timezone specified in device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-timezone
   */
  getTimezone() {
    return rp(this.getOptions(`v2/devices/${this.deviceId}/settings/System.timeZone`))
      .catch(checkError);
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

/*
 * Checks if it's safe to ignore errors
 * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#response-codes
 */
function checkError(err) {
  debug('Device Settings Error %s', JSON.stringify(err, null, 2));

  if (err.statusCode === 204 || err.error.code === 204) {
    return undefined;
  }

  throw err;
}

module.exports = DeviceSettings;
