import { RequestEnvelope } from "ask-sdk-model";

import { DeviceBase } from "./DeviceBase";

export class DeviceSettings extends DeviceBase {
  constructor(event: RequestEnvelope) {
    super(event);

    this.tag = "DeviceSettings";
    this.errorCodeSafeToIgnore = 204;
  }

  /**
   * Gets distance unit associated to device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-distance-measurement-unit
   */
  public getDistanceUnits(): Promise<string> {
    return this.getResult(
      `v2/devices/${this.deviceId}/settings/System.distanceUnits`,
    ).catch((err: any) => this.checkError(err));
  }

  /**
   * Gets temperature unit associated to device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-temperature-measurement-unit
   */
  public getTemperatureUnits(): Promise<string> {
    return this.getResult(
      `v2/devices/${this.deviceId}/settings/System.temperatureUnits`,
    ).catch((err: any) => this.checkError(err));
  }

  /**
   * Gets the timezone specified in device settings
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html#get-the-timezone
   */
  public getTimezone(): Promise<string> {
    return this.getResult(
      `v2/devices/${this.deviceId}/settings/System.timeZone`,
    ).catch((err: any) => this.checkError(err));
  }

  /**
   * Gets timezone, distance and temperature units associated
   * to device settings in a single object
   * https://developer.amazon.com/docs/smapi/alexa-settings-api-reference.html
   */
  public async getSettings() {
    const infoRequests = [
      this.getDistanceUnits(),
      this.getTemperatureUnits(),
      this.getTimezone(),
    ];

    const [distanceUnits, temperatureUnits, timezone] = await Promise.all(
      infoRequests,
    );

    return {
      distanceUnits,
      temperatureUnits,
      timezone,
    };
  }
}
