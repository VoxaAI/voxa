'use strict';

const VoxaAdapter = require('../VoxaAdapter');
const LuisRecognizer = require('./LuisRecognizer');
const CortanaRecognizer = require('./CortanaRecognizer');
const CortanaActivity = require('./CortanaActivity');
const CortanaEvent = require('./CortanaEvent');
const rp = require('request-promise');
const _ = require('lodash');

const CortanaRequests = [
  'conversationUpdate',
];

class CortanaAdapter extends VoxaAdapter {
  constructor(voxaApp, config) {
    super(voxaApp);
    if (!config.recognizer) {
      throw new Error('Cortana requires a recognizer');
    }

    this.recognizer = config.recognizer;
    this.applicationId = config.applicationId;
    this.applicationPassword = config.applicationPassword;
    this.qAuthorization = this.getAuthorization();
    _.forEach(CortanaRequests, requestType => voxaApp.registerRequestHandler(requestType));
  }

  getAuthorization() {
    const requestOptions = {
      url: 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token',
      method: 'POST',
      json: true,
      form: {
        grant_type: 'client_credentials',
        client_id: this.applicationId,
        client_secret: this.applicationPassword,
        scope: 'https://api.botframework.com/.default',
      },
    };


    return rp(requestOptions);
  }

  execute(rawEvent, context) {
    let qEvent = Promise.resolve(new CortanaEvent(rawEvent, context));
    if (rawEvent.text) {
      qEvent = this.recognizer.recognize(rawEvent, context);
    }

    return qEvent
      .then(event => this.app.execute(event))
      .then(voxaReply => this.replyToActivity(rawEvent, new CortanaActivity(rawEvent, voxaReply)));
  }

  replyToActivity(event, activity) {
    const baseUri = event.serviceUrl;
    const conversationId = event.conversation.id;
    const activityId = event.id;

    return this.qAuthorization.then((authorization) => {
      console.log(authorization);
      const requestOptions = {
        method: 'POST',
        json: true,
        url: `${baseUri}/v3/conversations/${conversationId}/activities/${activityId}`,
        body: activity.toJSON(),
        headers: {
          Authorization: `Bearer ${authorization.access_token}`,
        },
      };

      console.log(requestOptions);

      return rp(requestOptions);
    });
  }
}

module.exports = CortanaAdapter;
module.exports.LuisRecognizer = LuisRecognizer;
module.exports.CortanaRecognizer = CortanaRecognizer;
