/**
 * Alexa Reply
 *
 * See message-renderer to see the msg structure that
 * Reply expects.
 *
 * TODO: validate that no more text is appeneded after
 * has yielded.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const S = require('string');

const SSML = 'SSML';

class Response {
  constructor(request, msg) {
    this.session = request.session;
    this.msg = {
      statements: [],
      reprompt: '',
      card: null,
      yield: false,
      hasAnAsk: false,
      directives: {},
    };
    this.append(msg);
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

  append(msg) {
    if (!msg) return this;
    const statement = msg.ask || msg.tell || msg.say;
    if (statement) this.msg.statements.push(statement);
    this.msg.reprompt = msg.reprompt || this.msg.reprompt;
    this.msg.card = msg.card || this.msg.card;
    this.msg.yield = this.msg.yield || !!(msg.ask || msg.tell);
    this.msg.hasAnAsk = this.msg.hasAnAsk || !!msg.ask;
    this.msg.directives = msg.directives || this.msg.directives;
    return this;
  }

  end() {
    this.yield = true;
    return this;
  }

  isYielding() {
    return this.msg.yield;
  }

  render() {
    const say = wrapSpeech(toSSML(this.msg.statements.join('\n')));
    const reprompt = wrapSpeech(toSSML(this.msg.reprompt));
    return { say, reprompt };
  }

  write() {
    const rendered = this.render();
    if (this.msg.hasAnAsk) {
      return this.ask(rendered.say, rendered.reprompt, this.msg.card, this.msg.directives);
    }
    return this.tell(rendered.say, this.msg.card, this.msg.directives);
  }

}

function toSSML(statement) {
  if (!statement) return null;
  if (S(statement).startsWith('<speak>')) return statement;
  statement = statement.replace(/&/g, '&amp;'); // Hack. Full xml escaping would be better, but the & is currently the only special character used.
  return `<speak>${statement}</speak>`;
}

function wrapSpeech(statement) {
  if (!statement) return null;
  return { speech: statement, type: SSML };
}

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
module.exports = Response;
