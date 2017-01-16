'use strict';

class Response {
  constructor(context, session) {
    this._context = context;
    this._session = session;
  }

  tell(speechOutput, card, directives) {
    this._context.succeed(buildSpeechletResponse({
      session: this._session,
      output: speechOutput,
      card: card,
      directives: directives,
      shouldEndSession: true,
    }));
  }

  ask(speechOutput, repromptSpeech, card, directives) {
    this._context.succeed(buildSpeechletResponse({
      session: this._session,
      output: speechOutput,
      reprompt: repromptSpeech,
      card: card,
      directives: directives,
      shouldEndSession: false,
    }));
  }
}

function createSpeechObject(optionsParam) {
  if (!optionsParam) return null;
  if (optionsParam && optionsParam.type === 'SSML') {
    return {
      type: optionsParam.type,
      ssml: optionsParam.speech,
    };
  } else {
    return {
      type: optionsParam.type || 'PlainText',
      text: optionsParam.speech || optionsParam,
    };
  }
}

function buildSpeechletResponse(options) {
  var alexaResponse = {
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
    } else {
      if (options.directives.type) {
        alexaResponse.directives = [
          {
            type: options.directives.type,
          },
        ];
      }
    }
  }

  var returnResult = {
    version: '1.0',
    response: alexaResponse,
  };

  if (options.session && options.session.attributes) {
    returnResult.sessionAttributes = options.session.attributes;
  }

  return returnResult;
}

module.exports = Response;
