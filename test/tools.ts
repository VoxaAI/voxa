import { Session, SlotValue } from "alexa-sdk";
import * as _ from "lodash";
import { v1 } from "uuid";
import { IAlexaRequest, ILaunchRequest, ISessionEndedRequest } from "../src/platforms/alexa/AlexaEvent";
import { IIntentRequest } from "../src/platforms/alexa/AlexaIntent";

export class AlexaRequestBuilder {
  public version = "1.0";
  public applicationId: string;
  public deviceId: string;
  public userId: string;

  constructor(userId?: string, applicationId?: string) {
    this.userId = userId || `amzn1.ask.account.${v1()}`;
    this.applicationId = applicationId || `amzn1.ask.skill.${v1()}`;
    this.deviceId = applicationId || `amzn1.ask.device.${v1()}`;
  }

  public getSessionEndedRequest(reason: string): ISessionEndedRequest {
    return {
      context: this.getContextData(),
      request: {
        locale: "en-US",
        reason,
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        type: "SessionEndedRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getIntentRequest(intentName: string, slots?: any): IIntentRequest {
    if (!slots) {
      slots = {};
    } else {
      slots = _(slots)
        .keys()
        .map((key) => [key, { name: key, value: slots[key] }])
        .fromPairs()
        .value();
    }

    return {
      context: this.getContextData(),
      request: {
        intent: { name: intentName, slots },
        locale: "en-US",
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        type: "IntentRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getContextData() {
    return {
      AudioPlayer: {
        playerActivity: "IDLE",
      },
      System: {
        apiAccessToken: v1(),
        apiEndpoint: "https://api.amazonalexa.com/",
        application: { applicationId: this.applicationId },
        device: {
          deviceId: this.deviceId,
          supportedInterfaces: {
            AudioPlayer: {},
            Display: {},
          },
        },
        user: { userId: this.userId },
      },
    };
  }
  public getSessionData(): Session {
    return {
      // randomized for every session and set before calling the handler
      application: { applicationId: this.applicationId },
      attributes: {},
      new: true,
      sessionId: `SessionId.${v1()}`,
      user: {
        permissions: {
          consentToken: "",
        },
        userId: this.userId,
      },
    };
  }

  public getLaunchRequest(): ILaunchRequest {
    return {
      context: this.getContextData(),
      request: {
        locale: "en-US",
        requestId: "EdwRequestId." + v1(),
        timestamp: new Date().toISOString(),
        type: "LaunchRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };

  }
}
