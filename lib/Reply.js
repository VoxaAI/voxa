/**
 * Alexa Reply
 *
 * See message-renderer to see the msg structure that
 * Reply expects.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const S = require('string');
const _ = require('lodash');

const SSML = 'SSML';

class Reply {
  constructor(alexaEvent, msg) {
    this.alexaEvent = alexaEvent;
    this.session = alexaEvent.session;
    this.msg = {
      statements: [],
      reprompt: '',
      card: undefined,
      yield: false,
      hasAnAsk: false,
      directives: {},
    };
    this.append(msg);
  }


  tell(speechOutput, card, directives) {
    return Reply.buildSpeechletResponse({
      card,
      directives,
      session: this.session,
      output: speechOutput,
      shouldEndSession: true,
    });
  }

  ask(speechOutput, repromptSpeech, card, directives) {
    return Reply.buildSpeechletResponse({
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
    if (msg instanceof Reply) return this.appendReply(msg);
    if (_.isArray(msg)) {
      _.map(msg, m => this.append(m));
      return this;
    }

    const statement = msg.ask || msg.tell || msg.say;
    if (statement) {
      if (this.msg.yield) {
        throw new Error('Can\'t append to already yielding response');
      }
      this.msg.statements.push(statement);
    }

    this.msg.reprompt = msg.reprompt || this.msg.reprompt;
    this.msg.card = msg.card || this.msg.card;
    this.msg.yield = this.msg.yield || !!(msg.ask || msg.tell);
    this.msg.hasAnAsk = this.msg.hasAnAsk || !!msg.ask;
    this.msg.directives = msg.directives || this.msg.directives;
    return this;
  }

  appendReply(reply) {
    this.msg.statements = _.concat(this.msg.statements, reply.msg.statements);
    this.msg.yield = this.msg.yield || reply.isYielding();
    this.msg.hasAnAsk = this.msg.hasAnAsk || reply.msg.hasAnAsk;

    this.msg.reprompt = reply.msg.reprompt || this.msg.reprompt;
    this.msg.card = reply.msg.card || this.msg.card;
    this.msg.directives = reply.msg.directives || this.msg.directives;

    return this;
  }

  end() {
    this.msg.yield = true;
    return this;
  }

  isYielding() {
    return this.msg.yield;
  }

  render() {
    const say = Reply.wrapSpeech(Reply.toSSML(this.msg.statements.join('\n')));
    const reprompt = Reply.wrapSpeech(Reply.toSSML(this.msg.reprompt));
    return { say, reprompt };
  }

  toJSON() {
    const rendered = this.render();
    if (this.msg.hasAnAsk) {
      return this.ask(rendered.say, rendered.reprompt, this.msg.card, this.msg.directives);
    }
    return this.tell(rendered.say, this.msg.card, this.msg.directives);
  }

  static toSSML(statement) {
    if (!statement) return undefined;
    if (S(statement).startsWith('<speak>')) return statement;
    statement = statement.replace(/&/g, '&amp;'); // Hack. Full xml escaping would be better, but the & is currently the only special character used.
    return `<speak>${statement}</speak>`;
  }

  static wrapSpeech(statement) {
    if (!statement) return undefined;
    return { speech: statement, type: SSML };
  }

  static createSpeechObject(optionsParam) {
    if (!optionsParam) return undefined;
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

  static buildSpeechletResponse(options) {
    const alexaResponse = {
      outputSpeech: Reply.createSpeechObject(options.output),
      shouldEndSession: options.shouldEndSession,
      card: options.card,
    };

    if (options.reprompt) {
      alexaResponse.reprompt = {
        outputSpeech: Reply.createSpeechObject(options.reprompt),
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
}

module.exports = Reply;
