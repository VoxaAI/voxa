/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { EventBuilder } from "./EventBuilder";

/**
 * Weather Alert Events Builder class reference
 */
export class WeatherAlertEventBuilder extends EventBuilder {
  public alertType: WEATHER_ALERT_TYPE = WEATHER_ALERT_TYPE.DEFAULT;

  constructor() {
    super("AMAZON.WeatherAlert.Activated");
  }

  public setHurricane(): WeatherAlertEventBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.HURRICANE);

    return this;
  }

  public setSnowStorm(): WeatherAlertEventBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.SNOW_STORM);

    return this;
  }

  public setThunderStorm(): WeatherAlertEventBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.THUNDER_STORM);

    return this;
  }

  public setTornado(): WeatherAlertEventBuilder {
    this.setAlertType(WEATHER_ALERT_TYPE.TORNADO);

    return this;
  }

  public getPayload(): any {
    return {
      weatherAlert: {
        alertType: this.alertType,
        source: "localizedattribute:source",
      },
    };
  }

  private setAlertType(alertType: WEATHER_ALERT_TYPE) {
    this.alertType = alertType;
  }
}

export enum WEATHER_ALERT_TYPE {
  DEFAULT = "",
  HURRICANE = "HURRICANE",
  SNOW_STORM = "SNOW_STORM",
  THUNDER_STORM = "THUNDER_STORM",
  TORNADO = "TORNADO",
}
