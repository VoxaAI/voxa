'use strict';

const VoxaAdapter = require('../VoxaAdapter');
const AlexaEvent = require('./AlexaEvent');
const ssml = require('../../ssml');
const _ = require('lodash');
const debug = require('debug')('voxa');

class AlexaAdapter extends VoxaAdapter {
  constructor(voxaApp) {
    super(voxaApp);

    voxaApp.onAfterStateChanged((voxaEvent, reply, transition) => {
      const message = _.get(transition, 'message');
      if (message) {
        const directives = _.map(message, 'directives');

        if (_.find(_.flatten(directives), { type: 'Dialog.Delegate' })) {
          reply.msg.hasAnAsk = true;
          reply.end();
        }
      }

      return transition;
    });
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
    const reprompt = ssml.toSSML(voxaReply.msg.reprompts.join('\n'));
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
    };

    if (voxaReply.msg.statements.length || directives.length) {
      returnResult.response = alexaResponse;
    }

    if (voxaReply.session && !_.isEmpty(voxaReply.session.attributes)) {
      returnResult.sessionAttributes = voxaReply.session.attributes;
    }

    debug('toAlexaReply');
    debug(returnResult);

    return returnResult;
  }
}

module.exports = AlexaAdapter;
