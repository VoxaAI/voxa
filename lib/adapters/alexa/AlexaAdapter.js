'use strict';

const VoxaAdapter = require('../VoxaAdapter');
const DisplayTemplate = require('./DisplayTemplateBuilder');
const AlexaEvent = require('./AlexaEvent');
const ssml = require('../../ssml');
const _ = require('lodash');
const debug = require('debug')('voxa:alexa');
const rp = require('request-promise');
const url = require('url');

const SSML = 'SSML';

const AlexaRequests = [
  'AudioPlayer.PlaybackStarted',
  'AudioPlayer.PlaybackFinished',
  'AudioPlayer.PlaybackNearlyFinished',
  'AudioPlayer.PlaybackStopped',
  'AudioPlayer.PlaybackFailed',
  'System.ExceptionEncountered',
  'PlaybackController.NextCommandIssued',
  'PlaybackController.PauseCommandIssued',
  'PlaybackController.PlayCommandIssued',
  'PlaybackController.PreviousCommandIssued',
  'AlexaSkillEvent.SkillAccountLinked',
  'AlexaSkillEvent.SkillEnabled',
  'AlexaSkillEvent.SkillDisabled',
  'AlexaSkillEvent.SkillPermissionAccepted',
  'AlexaSkillEvent.SkillPermissionChanged',
  'AlexaHouseholdListEvent.ItemsCreated',
  'AlexaHouseholdListEvent.ItemsUpdated',
  'AlexaHouseholdListEvent.ItemsDeleted',
  'Display.ElementSelected',
];

class AlexaAdapter extends VoxaAdapter {
  constructor(voxaApp) {
    super(voxaApp);
    this.app.onAfterStateChanged((voxaEvent, reply, transition) => AlexaAdapter.partialReply(voxaEvent, reply));
    _.forEach(AlexaRequests, requestType => voxaApp.registerRequestHandler(requestType));
  }

  execute(rawEvent, context) {
    const alexaEvent = new AlexaEvent(rawEvent, context);
    return this.app.execute(alexaEvent)
      .then(AlexaAdapter.toAlexaReply);
  }

  static createSpeechObject(optionsParam) {
    if (!optionsParam) return undefined;
    if (optionsParam.type === 'SSML') {
      return {
        type: optionsParam.type,
        ssml: optionsParam.speech,
      };
    }
    return {
      type: optionsParam.type || 'PlainText',
      text: optionsParam.speech || optionsParam,
    };
  }

  static wrapSpeech(statement) {
    if (!statement) return undefined;
    return { speech: statement, type: SSML };
  }

  static toAlexaReply(voxaReply) {
    if (!voxaReply) {
      return {
        version: '1.0',
      };
    }

    const say = AlexaAdapter.wrapSpeech(ssml.toSSML(voxaReply.msg.statements.join('\n')));
    const reprompt = AlexaAdapter.wrapSpeech(ssml.toSSML(voxaReply.msg.reprompt));
    const directives = voxaReply.msg.directives;

    const alexaResponse = {
      outputSpeech: AlexaAdapter.createSpeechObject(say),
      card: voxaReply.msg.card,
    };

    if (!voxaReply.hasDirective('VideoApp.Launch')) {
      alexaResponse.shouldEndSession = !!voxaReply.msg.terminate;
    }

    if (reprompt) {
      alexaResponse.reprompt = {
        outputSpeech: AlexaAdapter.createSpeechObject(reprompt),
      };
    }

    const supportDisplayInterface = !!_.get(voxaReply, 'voxaEvent.context.System.device.supportedInterfaces.Display');
    if (directives && directives.length > 0) {
      // all alexa directives have a type field
      alexaResponse.directives = _.filter(directives, (directive) => {
        if (!directive.type) {
          // all alexa directives have a type
          return false;
        }

        if (directive instanceof DisplayTemplate && !supportDisplayInterface) {
          return false;
        }

        if (directive.type === 'Display.RenderTemplate' && !supportDisplayInterface) {
          return false;
        }

        return true;
      });
    }

    console.log({ directives: alexaResponse.directives, supportDisplayInterface });
    if (_.filter(alexaResponse.directives, { type: 'Display.RenderTemplate' }).length > 1) {
      throw new Error('At most one Display.RenderTemplate directive can be specified in a response');
    }

    if (_.filter(alexaResponse.directives, { type: 'Hint' }).length > 1) {
      throw new Error('At most one Hint directive can be specified in a response');
    }

    if (_.find(alexaResponse.directives, { type: 'AudioPlayer.Play' }) && _.find(alexaResponse.directives, { type: 'VideoApp.Launch' })) {
      throw new Error('Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response');
    }

    const returnResult = {
      version: '1.0',
      response: alexaResponse,
    };

    if (voxaReply.session && !_.isEmpty(voxaReply.session.attributes)) {
      returnResult.sessionAttributes = voxaReply.session.attributes;
    } else {
      returnResult.sessionAttributes = {};
    }

    return returnResult;
  }

  /*
   * Sends a partial reply after every state change
   */
  static partialReply(event, reply) {
    if (!_.get(event, 'context.System.apiEndpoint')) {
      return Promise.resolve(null);
    }

    if (reply.isYielding()) {
      return Promise.resolve(null);
    }

    const endpoint = url.resolve(event.context.System.apiEndpoint, '/v1/directives');
    const authorizationToken = event.context.System.apiAccessToken;
    const requestId = event.request.requestId;
    const speech = ssml.toSSML(reply.msg.statements.join('\n'));

    if (!speech) {
      return Promise.resolve(null);
    }

    const body = {
      header: {
        requestId,
      },
      directive: {
        type: 'VoicePlayer.Speak',
        speech,
      },
    };

    debug('apiRequest');
    debug(body);

    return AlexaAdapter.apiRequest(endpoint, body, authorizationToken)
      .then(() => {
        reply.msg.plainStatements = [];
        reply.msg.statements = [];
      });
  }

  static apiRequest(endpoint, body, authorizationToken) {
    const requestOptions = {
      method: 'POST',
      uri: endpoint,
      body,
      json: true,
      auth: {
        bearer: authorizationToken,
      },
    };

    return rp(requestOptions);
  }
}

module.exports = AlexaAdapter;
module.exports.DisplayTemplate = DisplayTemplate;
