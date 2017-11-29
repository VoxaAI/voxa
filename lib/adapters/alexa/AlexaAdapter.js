'use strict';

const VoxaAdapter = require('../VoxaAdapter');
const AlexaEvent = require('./AlexaEvent');
const ssml = require('../../ssml');
const _ = require('lodash');
const debug = require('debug')('voxa');
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

    if (directives && directives.length > 0) alexaResponse.directives = directives;

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
    const endpoint = url.resolve(event._raw.context.System.apiEndpoint, '/v1/directives');
    const authorizationToken = event._raw.context.System.apiAccessToken;
    const requestId = event._raw.request.requestId;

    const body = {
      header: {
        requestId,
      },
      directive: {
        type: 'VoicePlayer.Speak',
        speech: ssml.toSSML(reply.msg.statements.join('\n')),
      },
    };

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
