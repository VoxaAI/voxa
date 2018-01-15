"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var uuid_1 = require("uuid");
var AlexaRequestBuilder = /** @class */ (function () {
    function AlexaRequestBuilder(userId, applicationId) {
        this.version = "1.0";
        this.userId = userId || "amzn1.ask.account." + uuid_1.v1();
        this.applicationId = applicationId || "amzn1.ask.skill." + uuid_1.v1();
        this.deviceId = applicationId || "amzn1.ask.device." + uuid_1.v1();
    }
    AlexaRequestBuilder.prototype.getSessionEndedRequest = function (reason) {
        return {
            context: this.getContextData(),
            request: {
                locale: "en-US",
                reason: reason,
                requestId: "EdwRequestId." + uuid_1.v1(),
                timestamp: new Date().toISOString(),
                type: "SessionEndedRequest",
            },
            session: this.getSessionData(),
            version: this.version,
        };
    };
    AlexaRequestBuilder.prototype.getIntentRequest = function (intentName, slots) {
        if (!slots) {
            slots = {};
        }
        else {
            slots = _(slots)
                .keys()
                .map(function (key) { return [key, { name: key, value: slots[key] }]; })
                .fromPairs()
                .value();
        }
        return {
            context: this.getContextData(),
            request: {
                intent: { name: intentName, slots: slots },
                locale: "en-US",
                requestId: "EdwRequestId." + uuid_1.v1(),
                timestamp: new Date().toISOString(),
                type: "IntentRequest",
            },
            session: this.getSessionData(),
            version: this.version,
        };
    };
    AlexaRequestBuilder.prototype.getContextData = function () {
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
    };
    AlexaRequestBuilder.prototype.getSessionData = function () {
        return {
            // randomized for every session and set before calling the handler
            application: { applicationId: this.applicationId },
            attributes: {},
            new: true,
            sessionId: "SessionId." + uuid_1.v1(),
            user: {
                permissions: {
                    consentToken: "",
                },
                userId: this.userId,
            },
        };
    };
    AlexaRequestBuilder.prototype.getLaunchRequest = function () {
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
    };
    return AlexaRequestBuilder;
}());
exports.AlexaRequestBuilder = AlexaRequestBuilder;
//# sourceMappingURL=tools.js.map