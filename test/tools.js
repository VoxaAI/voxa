'use strict';

const _ = require('lodash');
const uuidv1 = require('uuid/v1');

class AlexaRequestBuilder {
  constructor(userId, applicationId) {
    this.userId = userId || `amzn1.ask.account.${uuidv1()}`;
    this.applicationId = applicationId || `amzn1.ask.skill.${uuidv1()}`;
    this.deviceId = applicationId || `amzn1.ask.device.${uuidv1()}`;
  }

  getSessionEndedRequest(reason) {
    return {
      version: '1.0',
      session: this.getSessionData(),
      context: this.getContextData(),
      request: {
        type: 'SessionEndedRequest',
        requestId: `EdwRequestId.${uuidv1()}`,
        timestamp: new Date().toISOString(),
        locale: 'en-US',
        reason,
      },
    };
  }

  getIntentRequest(intentName, slots) {
    if (!slots) {
      slots = {};
    } else {
      slots = _(slots)
        .keys()
        .map(key => [key, { name: key, value: slots[key] }])
        .fromPairs()
        .value();
    }

    return {
      version: '1.0',
      session: this.getSessionData(),
      context: this.getContextData(),
      request: {
        type: 'IntentRequest',
        requestId: `EdwRequestId.${uuidv1()}`,
        timestamp: new Date().toISOString(),
        locale: 'en-US',
        intent: { name: intentName, slots },
      },
    };
  }

  getContextData() {
    return {
      System: {
        application: { applicationId: this.applicationId },
        user: { userId: this.userId },
        device: {
          deviceId: this.deviceId,
          supportedInterfaces: {
            AudioPlayer: {},
            Display: {},
          },
        },
        apiEndpoint: 'https://api.amazonalexa.com/',
        apiAccessToken: uuidv1(),
      },
      AudioPlayer: {
        playerActivity: 'IDLE',
      },
    };
  }
  getSessionData() {
    return {
      // randomized for every session and set before calling the handler
      sessionId: `SessionId.${uuidv1()}`,
      application: { applicationId: this.applicationId },
      attributes: {},
      user: { userId: this.userId },
      new: true,
    };
  }
}

module.exports = {
  AlexaRequestBuilder,
};

