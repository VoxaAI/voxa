'use strict';

const _ = require('lodash');
const VoxaReply = require('../VoxaReply');

class AlexaReply extends VoxaReply {
  toJSON() {
    const say = VoxaReply.wrapSpeech(VoxaReply.toSSML(this.msg.statements.join('\n')));
    const reprompt = VoxaReply.wrapSpeech(VoxaReply.toSSML(this.msg.reprompt));
    const directives = this.msg.directives;
    const isAsk = !!this.msg.hasAnAsk;

    const alexaResponse = {
      outputSpeech: VoxaReply.createSpeechObject(say),
      shouldEndSession: !isAsk,
      card: this.msg.card,
    };

    if (reprompt && isAsk) {
      alexaResponse.reprompt = {
        outputSpeech: VoxaReply.createSpeechObject(reprompt),
      };
    }
    if (directives && directives.length > 0) alexaResponse.directives = directives;

    const returnResult = {
      version: '1.0',
      response: alexaResponse,
    };

    if (this.session && !_.isEmpty(this.session.attributes)) {
      returnResult.sessionAttributes = this.session.attributes;
    } else {
      returnResult.sessionAttributes = {};
    }


    return returnResult;
  }
}

module.exports = AlexaReply;
