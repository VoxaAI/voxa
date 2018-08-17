'use strict';

const _ = require('lodash');
const rp = require('request-promise');

class DeviceAddress {
  constructor(alexaEvent) {
    this.apiAccessToken = _.get(alexaEvent, 'context.System.apiAccessToken');
    this.apiEndpoint = _.get(alexaEvent, 'context.System.apiEndpoint');
    this.deviceId = _.get(alexaEvent, 'context.System.device.deviceId');
  }

  /*
   * Calls the Alexa's Device Address API
   * https://developer.amazon.com/docs/custom-skills/device-address-api.html
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
   * Gets the full address associated with the device specified by deviceId.
   * https://developer.amazon.com/docs/custom-skills/device-address-api.html#getAddress
   */
  getAddress() {
    return rp(this.getOptions(`v1/devices/${this.deviceId}/settings/address`));
  }

  /*
   * Gets the country/region and postal code associated with a device
   * specified by deviceId. The endpoint is case-sensitive.
   * https://developer.amazon.com/docs/custom-skills/device-address-api.html#getCountryAndPostalCode
   */
  getCountryRegionPostalCode() {
    return rp(this.getOptions(`v1/devices/${this.deviceId}/settings/address/countryAndPostalCode`));
  }
}

module.exports = DeviceAddress;
