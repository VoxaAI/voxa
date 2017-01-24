'use strict';

module.exports = {
  version: '1.0',
  session: {
    new: true,
    sessionId: 'amzn1.echo-api.session.313f7d57-d7b9-4c84-9734-7cd02841ade0',
    application: {
      applicationId: 'some-app-id',
    },
    user: {
      userId: 'amzn1.ask.account.xxx',
    },
  },
  context: {
    AudioPlayer: {
      offsetInMilliseconds: 353160,
      token: '{"index":1,"shuffle":0,"loop":0}',
      playerActivity: 'STOPPED',
    },
    System: {
      application: {
        applicationId: 'amzn1.ask.skill.efe8bf1e-7664-47ff-a2a7-8e1ccaf46af8',
      },
      user: {
        userId: 'amzn1.ask.account.xxx',
      },
      device: {
        supportedInterfaces: {
          AudioPlayer: {},
        },
      },
    },
  },
  request: {
    type: 'IntentRequest',
    requestId: 'amzn1.echo-api.request.784a46e0-8d0e-4ffc-9040-adb1cf29ef0a',
    timestamp: '2016-10-07T17:03:27Z',
    locale: 'en-US',
    intent: {
      name: 'AMAZON.PreviousIntent',
    },
  },
};
