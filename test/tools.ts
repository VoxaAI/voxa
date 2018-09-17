import {
  Context,
  interfaces,
  RequestEnvelope,
  services,
  Session,
  SessionEndedReason,
} from "ask-sdk-model";
import {
  APIGatewayProxyEvent,
  Callback as AWSLambdaCallback,
  Context as AWSLambdaContext,
} from "aws-lambda";
import * as _ from "lodash";
import { v1 } from "uuid";

import { AlexaEvent } from "../src/platforms/alexa/AlexaEvent";

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

  public getSessionEndedRequest(
    reason: SessionEndedReason = "ERROR",
    error?: any,
  ): RequestEnvelope {
    return {
      context: this.getContextData(),
      request: {
        error,
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

  public getDisplayElementSelectedRequest(token: string): RequestEnvelope {
    return {
      context: this.getContextData(),
      request: {
        locale: "en-US",
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        token,
        type: "Display.ElementSelected",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getCanFulfillIntentRequestRequest(
    intentName: string,
    slots?: any,
  ): RequestEnvelope {
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
        intent: { name: intentName, slots, confirmationStatus: "NONE" },
        locale: "en-US",
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        type: "CanFulfillIntentRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getIntentRequest(intentName: string, slots?: any): RequestEnvelope {
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
        dialogState: "STARTED",
        intent: { name: intentName, slots, confirmationStatus: "NONE" },
        locale: "en-US",
        requestId: `EdwRequestId.${v1()}`,
        timestamp: new Date().toISOString(),
        type: "IntentRequest",
      },
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getContextData(): Context {
    return {
      AudioPlayer: {
        playerActivity: "IDLE",
      },
      System: {
        apiAccessToken: v1(),
        apiEndpoint: "https://api.amazonalexa.com",
        application: { applicationId: this.applicationId },
        device: {
          deviceId: this.deviceId,
          supportedInterfaces: {
            AudioPlayer: {},
            Display: {},
          },
        },
        user: {
          permissions: {
            consentToken: v1(),
          },
          userId: this.userId,
        },
      },
    };
  }
  public getSessionData(newSession: boolean = true): Session {
    return {
      // randomized for every session and set before calling the handler
      application: { applicationId: this.applicationId },
      attributes: {},
      new: newSession,
      sessionId: `SessionId.${v1()}`,
      user: {
        permissions: {
          consentToken: "",
        },
        userId: this.userId,
      },
    };
  }

  public getLaunchRequest(): RequestEnvelope {
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

  public getPlaybackStoppedRequest(token?: string): RequestEnvelope {
    const request: interfaces.audioplayer.PlaybackStoppedRequest = {
      locale: "en-US",
      requestId: "EdwRequestId." + v1(),
      timestamp: new Date().toISOString(),
      token,
      type: "AudioPlayer.PlaybackStopped",
    };

    return {
      context: this.getContextData(),
      request,
      session: this.getSessionData(),
      version: this.version,
    };
  }

  public getGameEngineInputHandlerEventRequest(
    buttonsRecognized: number = 1,
  ): RequestEnvelope {
    const request: interfaces.gameEngine.InputHandlerEventRequest = {
      events: [],
      locale: "en-US",
      requestId: `amzn1.echo-api.request.${v1()}`,
      timestamp: new Date().toISOString(),
      type: "GameEngine.InputHandlerEvent",
    };

    const eventArray: any[] = [];
    eventArray.push({
      inputEvents: [],
      name: "sample_event",
    });

    let id = 1;

    _.times(buttonsRecognized, () => {
      const event: any = {
        action: "down",
        color: "000000",
        feature: "press",
        gadgetId: `id${id}`,
        timestamp: "timestamp",
      };

      id += 1;

      eventArray[0].inputEvents.push(event);
    });

    request.events = eventArray;

    return {
      context: this.getContextData(),
      request,
      session: this.getSessionData(false),
      version: this.version,
    };
  }

  public getConnectionsResponseRequest(
    name: string,
    token: string,
    payload: any,
    status?: interfaces.connections.ConnectionsStatus,
  ): RequestEnvelope {
    status = status || { code: "200", message: "OK" };

    const request: interfaces.connections.ConnectionsResponse = {
      locale: "en-US",
      name,
      payload,
      requestId: `EdwRequestId.${v1()}`,
      status,
      timestamp: new Date().toISOString(),
      token,
      type: "Connections.Response",
    };

    return {
      context: this.getContextData(),
      request,
      session: this.getSessionData(false),
      version: this.version,
    };
  }
}

export function getLambdaContext(
  callback: AWSLambdaCallback<any>,
): AWSLambdaContext {
  return {
    awsRequestId: "aws://",
    callbackWaitsForEmptyEventLoop: false,
    functionName: "functionName",
    functionVersion: "0.1",
    invokedFunctionArn: "arn://",
    logGroupName: "",
    logStreamName: "",
    memoryLimitInMB: 128,

    getRemainingTimeInMillis: () => 1000,

    done: callback,
    fail: (err: Error | string) => {
      if (_.isString(err)) {
        return callback(new Error(err));
      }

      return callback(err);
    },
    succeed: (msg: any) => callback(undefined, msg),
  };
}

export function getAPIGatewayProxyEvent(
  method: string = "GET",
  body: string | null = null,
): APIGatewayProxyEvent {
  return {
    body,
    headers: {},
    httpMethod: method,
    isBase64Encoded: false,
    path: "/",
    pathParameters: null,
    queryStringParameters: null,
    requestContext: {
      accountId: "",
      apiId: "",
      httpMethod: method,
      identity: {
        accessKey: null,
        accountId: null,
        apiKey: null,
        apiKeyId: null,
        caller: null,
        cognitoAuthenticationProvider: null,
        cognitoAuthenticationType: null,
        cognitoIdentityId: null,
        cognitoIdentityPoolId: null,
        sourceIp: "",
        user: null,
        userAgent: null,
        userArn: null,
      },
      path: "/",
      requestId: "",
      requestTimeEpoch: 123,
      resourceId: "",
      resourcePath: "/",
      stage: "",
    },
    resource: "",
    stageVariables: null,
  };
}

export function isAlexaEvent(voxaEvent: any): voxaEvent is AlexaEvent {
  return voxaEvent.alexa !== undefined;
}
