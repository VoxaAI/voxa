'use strict';

const VoxaAdapter = require('../VoxaAdapter');
const AlexaEvent = require('./AlexaEvent');
const ssml = require('../../ssml');
const _ = require('lodash');

class AlexaAdapter extends VoxaAdapter {
  lambda() {
    return (event, context, callback) => this.execute(event, context)
      .then(result => callback(null, result))
      .catch(callback);
  }

  execute(rawEvent, context) {
    const alexaEvent = new AlexaEvent(rawEvent, context);
    return this.app.execute(alexaEvent)
      .then(AlexaAdapter.toAlexaReply);
  }

  static createSpeechObject(speech) {
    return {
      type: 'SSML',
      ssml: speech,
    };
  }

  static wrapSpeech(statement) {
    if (!statement) return undefined;
    return { speech: statement, type: 'SSML' };
  }

  static toAlexaReply(voxaReply) {
    const say = ssml.toSSML(voxaReply.msg.statements.join('\n'));
    const reprompt = voxaReply.msg.reprompts.join('\n');
    const directives = voxaReply.msg.directives;
    const isAsk = !!voxaReply.msg.hasAnAsk;

    const alexaResponse = {
      outputSpeech: AlexaAdapter.createSpeechObject(say),
      shouldEndSession: !isAsk,
      card: voxaReply.msg.card,
    };

    if (reprompt && isAsk) {
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
}

module.exports = AlexaAdapter;
