'use strict';

const Promise = require('bluebird');
const VoxaAdapter = require('../VoxaAdapter');
const LuisRecognizer = require('./LuisRecognizer');
const CortanaRecognizer = require('./CortanaRecognizer');
const CortanaActivity = require('./CortanaActivity');
const CortanaEvent = require('./CortanaEvent');
const rp = require('request-promise');
const errors = require('request-promise/errors');
const _ = require('lodash');
const url = require('url');

const CortanaRequests = [
  'conversationUpdate',
];

class CortanaAdapter extends VoxaAdapter {
  constructor(voxaApp, config) {
    super(voxaApp);
    if (!config.recognizer) {
      throw new Error('Cortana requires a recognizer');
    }

    if (!config.storage) {
      throw new Error('Cortana requires an state storage');
    }

    this.recognizer = config.recognizer;
    this.storage = config.storage;
    this.applicationId = config.applicationId;
    this.applicationPassword = config.applicationPassword;
    this.qAuthorization = this.getAuthorization();
    this.app.onAfterStateChanged((voxaEvent, reply, transition) => this.partialReply(voxaEvent, reply));

    _.forEach(CortanaRequests, requestType => voxaApp.registerRequestHandler(requestType));
  }

  partialReply(event, reply) {
    if (reply.isYielding()) {
      return Promise.resolve();
    }

    const activity = new CortanaActivity(event, reply);
    return this.replyToActivity(event, activity)
      .then(() => {
        reply.msg.plainStatements = [];
        reply.msg.statements = [];
        reply.msg.directives = [];
      });
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
      .then(event => this.app.execute(event)
        .then((reply) => {
          const activity = new CortanaActivity(event, reply);
          return Promise.all([
            this.replyToActivity(event, activity),
            this.saveStateData(event, activity),
          ]);
        }));
  }

  replyToActivity(event, activity) {
    const baseUri = event._raw.serviceUrl;
    const conversationId = encodeURIComponent(event.session.sessionId);
    const activityId = encodeURIComponent(event._raw.id);

    if (!activity.voxaReply.msg.statements.length) {
      return Promise.resolve(null);
    }

    const uri = url.resolve(baseUri, `/v3/conversations/${conversationId}/activities/${activityId}`);
    return this.botApiRequest('POST', uri, activity);
  }

  getStateData(event) {
    const conversationId = encodeURIComponent(event.conversation.id);
    const userId = encodeURIComponent(event.from.id);
    const context = {
      userId,
      conversationId,
      persistConversationData: false,
      persistUserData: false,
    };

    return Promise.promisify(this.storage.getData, { context: this.storage })(context);
  }

  saveStateData(event, activity) {
    const conversationId = encodeURIComponent(event.session.sessionId);
    const userId = encodeURIComponent(event._raw.from.id);
    const persistConversationData = false;
    const persistUserData = false;
    const context = {
      userId,
      conversationId,
      persistConversationData,
      persistUserData,
    };

    const data = {
      userData: {},
      conversationData: {},
      // we're only gonna handle private conversation data, this keeps the code small
      // and more importantly it makes it so the programming model is the same between
      // the different platforms
      privateConversationData: activity.voxaReply.session.attributes,
    };

    return Promise.promisify(this.storage.saveData, { context: this.storage })(context, data);
  }

  botApiRequest(method, uri, body) {
    return this.qAuthorization.then((authorization) => {
      const requestOptions = {
        method,
        uri,
        body,
        json: true,
        auth: {
          bearer: authorization.access_token,
        },
      };

      return rp(requestOptions);
    })
      .catch(errors.StatusCodeError, (reason) => {
        if (reason.statusCode === 401) {
          this.qAuthorization = this.getAuthorization();
          return this.botApiRequest(method, uri, body);
        }

        return Promise.reject(reason);
      });
  }
}

module.exports = CortanaAdapter;
module.exports.LuisRecognizer = LuisRecognizer;
module.exports.CortanaRecognizer = CortanaRecognizer;
