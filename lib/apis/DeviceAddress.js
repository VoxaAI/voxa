'use strict';

const DeviceBase = require('./DeviceBase');

class DeviceAddress extends DeviceBase {
  /*
   * Gets the full address associated with the device specified by deviceId.
   * https://developer.amazon.com/docs/custom-skills/device-address-api.html#getAddress
   */
  getAddress() {
    return this.getResult(`v1/devices/${this.deviceId}/settings/address`);
  }

  /*
   * Gets the country/region and postal code associated with a device
   * specified by deviceId. The endpoint is case-sensitive.
   * https://developer.amazon.com/docs/custom-skills/device-address-api.html#getCountryAndPostalCode
   */
  getCountryRegionPostalCode() {
    return this.getResult(`v1/devices/${this.deviceId}/settings/address/countryAndPostalCode`);
  }
}

module.exports = DeviceAddress;
