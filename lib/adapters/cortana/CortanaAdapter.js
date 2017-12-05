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
const debug = require('debug')('voxa:cortana');

const CortanaRequests = [
  'conversationUpdate',
  'contactRelationUpdate',
];

class CortanaAdapter extends VoxaAdapter {
  constructor(voxaApp, config) {
    super(voxaApp);
    if (!config.recognizer) {
      throw new Error('Cortana requires a recognizer');
    }

    if (!config.storage) {
      throw new Error('Cortana requires a state storage');
    }

    this.recognizer = config.recognizer;
    this.storage = config.storage;
    this.applicationId = config.applicationId;
    this.applicationPassword = config.applicationPassword;
    this.qAuthorization = this.getAuthorization();
    this.app.onAfterStateChanged((voxaEvent, reply, transition) => this.partialReply(voxaEvent, reply, transition));

    _.forEach(CortanaRequests, requestType => voxaApp.registerRequestHandler(requestType));
  }

  /*
   * Sends a partial reply after every state change
   */
  partialReply(event, reply, transition) {
    const activity = new CortanaActivity(event, reply);
    const hasMessages = _.get(activity, 'voxaReply.msg.statements.length') > 0;
    const hasDirectives = _.get(activity, 'voxaReply.msg.directives.length') > 0;

    if (!hasMessages && !hasDirectives) {
      return Promise.resolve(null);
    }

    debug('partialReply');
    console.log({ hasMessages, hasDirectives, msg: activity.voxaReply.msg });
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
    debug('getAuthorization');
    debug(requestOptions);

    return rp.call(rp, requestOptions);
  }

  execute(rawEvent, context) {
    return this.qAuthorization
      .then(() => this.getStateData(rawEvent))
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
          const promises = [this.saveStateData(event, activity)];
          return Promise.all(promises);
        }));
  }

  replyToActivity(event, activity) {
    const baseUri = event._raw.serviceUrl;
    const conversationId = encodeURIComponent(event.session.sessionId);
    const activityId = encodeURIComponent(event._raw.id);

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
      privateConversationData: _.get(activity, 'voxaReply.session.attributes'),
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

      debug('botApiRequest');
      debug(JSON.stringify(requestOptions, null, 2));
      return rp.call(rp, requestOptions);
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
