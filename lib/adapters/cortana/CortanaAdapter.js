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
    return this.getStateData(rawEvent)
      .then((stateData) => {
        rawEvent.stateData = stateData;
        let event = new CortanaEvent(rawEvent, context);
        if (rawEvent.text) {
          event = this.recognizer.recognize(rawEvent, context);
        }
        return event;
      })
      .then(event => this.app.execute(event))
      .then((voxaReply) => {
        const activity = new CortanaActivity(rawEvent, voxaReply);
        return Promise.all([
          this.replyToActivity(rawEvent, activity),
          this.saveStateData(rawEvent, activity),
        ]);
      });
  }

  replyToActivity(event, activity) {
    const baseUri = event.serviceUrl;
    const conversationId = event.conversation.id;
    const activityId = event.id;

    return this.qAuthorization.then((authorization) => {
      const requestOptions = {
        method: 'POST',
        json: true,
        url: `${baseUri}/v3/conversations/${conversationId}/activities/${activityId}`,
        body: activity,
        headers: {
          Authorization: `Bearer ${authorization.access_token}`,
        },
      };

      console.log('replyToActivity', JSON.stringify(requestOptions, null, 2));

      return rp(requestOptions);
    });
  }

  getStateData(event) {
    const baseUri = event.serviceUrl;
    const channelId = event.channelId;
    const userId = event.from.id;
    return this.qAuthorization.then((authorization) => {
      const requestOptions = {
        method: 'GET',
        json: true,
        url: `${baseUri}/v3/botstate/${channelId}/users/${userId}`,
        headers: {
          Authorization: `Bearer ${authorization.access_token}`,
        },
      };

      console.log('getUserData', JSON.stringify(requestOptions, null, 2));

      return rp(requestOptions);
    });
  }

  saveStateData(event, activity) {
    const baseUri = event.serviceUrl;
    const channelId = event.channelId;
    const userId = event.from.id;

    return this.qAuthorization.then((authorization) => {
      const requestOptions = {
        method: 'POST',
        json: true,
        url: `${baseUri}/v3/botstate/${channelId}/users/${userId}`,
        body: {
          eTag: event.stateData.eTag,
          data: activity.voxaReply.session.attributes,
        },
        headers: {
          Authorization: `Bearer ${authorization.access_token}`,
        },
      };

      console.log('saveStateData', JSON.stringify(requestOptions, null, 2));

      return rp(requestOptions);
    });
  }
}

module.exports = CortanaAdapter;
module.exports.LuisRecognizer = LuisRecognizer;
module.exports.CortanaRecognizer = CortanaRecognizer;
