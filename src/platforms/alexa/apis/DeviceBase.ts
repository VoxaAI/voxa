import { RequestEnvelope } from "ask-sdk-model";
import * as _ from "lodash";

import { ApiBase } from "./ApiBase";

export class DeviceBase extends ApiBase {
  public deviceId: string = "";

  constructor(event: RequestEnvelope) {
    super(event);

    this.deviceId = _.get(event, "context.System.device.deviceId");
  }
}
