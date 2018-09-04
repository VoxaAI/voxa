import { RequestEnvelope } from "ask-sdk-model";
import * as debug from "debug";
import * as _ from "lodash";
import * as rp from "request-promise";

const alexalog: debug.IDebugger = debug("voxa:alexa");

export class ApiBase {
  public errorCodeSafeToIgnore: number = 0; // the code error to ignore on checkError function
  public tag: string = ""; // the class reference for error logging
  public voxaEvent: any; // the event as sent by the service

  constructor(event: RequestEnvelope) {
    this.voxaEvent = _.cloneDeep(event);
  }

  protected getResult(path = "", method = "GET", body = {}): any {
    const options = {
      body,
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      json: true, // Automatically parses the JSON string in the response
      method,
      uri: `${this.getEndpoint()}/${path}`,
    };

    return rp(options);
  }

  protected checkError(err: any) {
    alexalog(`${this.tag} Error %s`, JSON.stringify(err, null, 2));

    if (err.statusCode === this.errorCodeSafeToIgnore ||
      err.error.code === this.errorCodeSafeToIgnore) {
      return undefined;
    }

    throw err;
  }

  protected getToken() {
    return _.get(this.voxaEvent, "context.System.apiAccessToken");
  }

  protected getEndpoint() {
    return _.get(this.voxaEvent, "context.System.apiEndpoint");
  }
}
