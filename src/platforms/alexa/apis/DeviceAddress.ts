import { DeviceBase } from "./DeviceBase";

export class DeviceAddress extends DeviceBase {
  /*
   * Gets the full address associated with the device specified by deviceId.
   * https://developer.amazon.com/docs/custom-skills/device-address-api.html#getAddress
   */
  public getAddress() {
    return this.getResult(`v1/devices/${this.deviceId}/settings/address`);
  }

  /*
   * Gets the country/region and postal code associated with a device
   * specified by deviceId. The endpoint is case-sensitive.
   * https://developer.amazon.com/docs/custom-skills/device-address-api.html#getCountryAndPostalCode
   */
  public getCountryRegionPostalCode() {
    return this.getResult(`v1/devices/${this.deviceId}/settings/address/countryAndPostalCode`);
  }
}
