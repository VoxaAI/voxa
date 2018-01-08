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
    getSessionEndedRequest(reason) {
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
                intent: { name: intentName, slots },
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
}
exports.AlexaRequestBuilder = AlexaRequestBuilder;
//# sourceMappingURL=tools.js.map