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

class Reply {
  constructor(msg) {
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

  append(msg) {
    if (!msg) return this;
    if (msg.msg) {
      this.msg.statements = this.msg.statements.concat(msg.msg.statements);
      this.msg.reprompt = msg.msg.reprompt || this.msg.reprompt;
      this.msg.card = msg.msg.card || this.msg.card;
      this.msg.yield = this.msg.yield || msg.msg.yield;
      this.msg.hasAnAsk = this.msg.hasAnAsk || msg.msg.hasAnAsk;
      this.msg.directives = msg.msg.directives || this.msg.directives;
    } else {
      const statement = msg.ask || msg.tell || msg.say;
      if (statement) this.msg.statements.push(statement);
      this.msg.reprompt = msg.reprompt || this.msg.reprompt;
      this.msg.card = msg.card || this.msg.card;
      this.msg.yield = this.msg.yield || !!(msg.ask || msg.tell);
      this.msg.hasAnAsk = this.msg.hasAnAsk || !!msg.ask;
      this.msg.directives = msg.directives || this.msg.directives;
    }
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

  write(response) {
    const rendered = this.render();
    if (this.msg.hasAnAsk) {
      return response.ask(rendered.say, rendered.reprompt, this.msg.card, this.msg.directives);
    }
    return response.tell(rendered.say, this.msg.card, this.msg.directives);
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

module.exports = Reply;
