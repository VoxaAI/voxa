"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
const uuid_1 = require("uuid");
class AlexaRequestBuilder {
    constructor(userId, applicationId) {
        this.version = "1.0";
        this.userId = userId || `amzn1.ask.account.${uuid_1.v1()}`;
        this.applicationId = applicationId || `amzn1.ask.skill.${uuid_1.v1()}`;
        this.deviceId = applicationId || `amzn1.ask.device.${uuid_1.v1()}`;
    }
    getSessionEndedRequest(reason = "ERROR") {
        return {
            context: this.getContextData(),
            request: {
                locale: "en-US",
                reason,
                requestId: `EdwRequestId.${uuid_1.v1()}`,
                timestamp: new Date().toISOString(),
                type: "SessionEndedRequest",
            },
            session: this.getSessionData(),
            version: this.version,
        };
    }
    getIntentRequest(intentName, slots) {
        if (!slots) {
            slots = {};
        }
        else {
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
                requestId: `EdwRequestId.${uuid_1.v1()}`,
                timestamp: new Date().toISOString(),
                type: "IntentRequest",
            },
            session: this.getSessionData(),
            version: this.version,
        };
    }
    getContextData() {
        return {
            AudioPlayer: {
                playerActivity: "IDLE",
            },
            System: {
                apiAccessToken: uuid_1.v1(),
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
    getSessionData() {
        return {
            // randomized for every session and set before calling the handler
            application: { applicationId: this.applicationId },
            attributes: {},
            new: true,
            sessionId: `SessionId.${uuid_1.v1()}`,
            user: {
                permissions: {
                    consentToken: "",
                },
                userId: this.userId,
            },
        };
    }
    getLaunchRequest() {
        return {
            context: this.getContextData(),
            request: {
                locale: "en-US",
                requestId: "EdwRequestId." + uuid_1.v1(),
                timestamp: new Date().toISOString(),
                type: "LaunchRequest",
            },
            session: this.getSessionData(),
            version: this.version,
        };
    }
    getPlaybackStoppedRequest(token) {
        const request = {
            locale: "en-US",
            requestId: "EdwRequestId." + uuid_1.v1(),
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
}
exports.AlexaRequestBuilder = AlexaRequestBuilder;
function getLambdaContext(callback) {
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
        fail: (err) => {
            if (_.isString(err)) {
                return callback(new Error(err));
            }
            return callback(err);
        },
        succeed: (msg) => callback(undefined, msg),
    };
}
exports.getLambdaContext = getLambdaContext;
function getAPIGatewayProxyEvent(method = "GET", body = null) {
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
exports.getAPIGatewayProxyEvent = getAPIGatewayProxyEvent;
//# sourceMappingURL=tools.js.map