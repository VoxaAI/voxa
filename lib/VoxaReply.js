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

const _ = require('lodash');
const VoxaEvent = require('./VoxaEvent');

const SSML = 'SSML';

class VoxaReply {
  constructor(voxaEvent, msg) {
    if (!(voxaEvent instanceof VoxaEvent)) {
      throw new Error('First argument of Reply must be a VoxaEvent');
    }

    this.voxaEvent = voxaEvent;
    this.session = voxaEvent.session;
    this.msg = {
      statements: [],
      reprompts: [],
      card: undefined,
      yield: false,
      hasAnAsk: false,
      directives: [],
    };
    this.append(msg);
  }

  append(msg) {
    if (!msg) return this;
    if (msg instanceof VoxaReply) return this.appendReply(msg);
    if (_.isArray(msg)) {
      _.forEach(msg, m => this.append(m));
      return this;
    }

    const statement = msg.ask || msg.tell || msg.say;
    if (statement) {
      if (this.msg.yield) {
        throw new Error('Can\'t append to already yielding response');
      }
      this.msg.statements.push(statement);
    }

    if (msg.reprompt) {
      this.msg.reprompts.push(msg.reprompt);
    }

    this.msg.card = msg.card || this.msg.card;
    this.msg.yield = this.msg.yield || !!(msg.ask || msg.tell);
    this.msg.hasAnAsk = this.msg.hasAnAsk || !!msg.ask;

    this.msg.directives = this.msg.directives.concat(cannonicalizeDirectives(msg.directives));
    return this;
  }

  appendReply(reply) {
    this.msg.statements = _.concat(this.msg.statements, reply.msg.statements);
    this.msg.yield = this.msg.yield || reply.isYielding();
    this.msg.hasAnAsk = this.msg.hasAnAsk || reply.msg.hasAnAsk;

    this.msg.reprompts = this.msg.reprompts.concat(reply.msg.reprompts);
    this.msg.card = reply.msg.card || this.msg.card;
    this.msg.directives = this.msg.directives.concat(cannonicalizeDirectives(this.msg.directives));

    return this;
  }

  end() {
    this.msg.yield = true;
    return this;
  }

  isYielding() {
    return this.msg.yield;
  }

}


function cannonicalizeDirectives(directives) {
  if (!directives) return [];
  if (!_.isArray(directives)) directives = [directives];
  return directives.map(cannonicalizeDirective);
}

function cannonicalizeDirective(directive) {
  // Legacy support.
  // We used to support this slightly altered from spec version of the play directive.
  // We'll check if we think that's still happening and transform to the full Alexa directive
  if (directive.playBehavior && (directive.token || directive.url)) {
    return {
      type: directive.type,
      playBehavior: directive.playBehavior,
      audioItem: {
        stream: {
          token: directive.token,
          url: directive.url,
          offsetInMilliseconds: directive.offsetInMilliseconds,
        },
      },
    };
  }

  return directive;
}

module.exports = VoxaReply;
