'use strict';

function createSpeechObject(optionsParam) {
  if (!optionsParam) return null;
  if (optionsParam && optionsParam.type === 'SSML') {
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

function buildSpeechletResponse(options) {
  const alexaResponse = {
    outputSpeech: createSpeechObject(options.output),
    shouldEndSession: options.shouldEndSession,
    card: options.card,
  };

  if (options.reprompt) {
    alexaResponse.reprompt = {
      outputSpeech: createSpeechObject(options.reprompt),
    };
  }

  if (options.directives) {
    if (options.directives.playBehavior) {
      alexaResponse.directives = [
        {
          type: options.directives.type,
          playBehavior: options.directives.playBehavior,
          audioItem: {
            stream: {
              token: options.directives.token,
              url: options.directives.url,
              offsetInMilliseconds: options.directives.offsetInMilliseconds,
            },
          },
        },
      ];
    } else if (options.directives.type) {
      alexaResponse.directives = [
        {
          type: options.directives.type,
        },
      ];
    }
  }

  const returnResult = {
    version: '1.0',
    response: alexaResponse,
  };

  if (options.session && options.session.attributes) {
    returnResult.sessionAttributes = options.session.attributes;
  }

  return returnResult;
}

class Response {
  constructor(request) {
    this.session = request.session;
  }

  tell(speechOutput, card, directives) {
    return buildSpeechletResponse({
      card,
      directives,
      session: this.session,
      output: speechOutput,
      shouldEndSession: true,
    });
  }

  ask(speechOutput, repromptSpeech, card, directives) {
    return buildSpeechletResponse({
      card,
      directives,
      session: this.session,
      output: speechOutput,
      reprompt: repromptSpeech,
      shouldEndSession: false,
    });
  }
}


module.exports = Response;
