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
const debug = require('debug')('voxa:reply');
const striptags = require('striptags');

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
      plainStatements: [],
      reprompts: [],
      plainReprompts: [],
      card: undefined,
      yield: false,
      hasAnAsk: false,
      directives: [],
    };
    this.append(msg);
  }

  append(msg) {
    debug('append');
    debug(msg);
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

    if (msg.plain) {
      this.msg.plainStatements.push(msg.plain);
    } else if (statement) {
      this.msg.plainStatements.push(striptags(statement));
    }

    if (msg.reprompt) {
      this.msg.reprompts.push(msg.reprompt);
    }

    if (msg.plainReprompt) {
      this.msg.plainReprompts.push(msg.plainReprompt);
    } else if (msg.reprompt) {
      this.msg.plainReprompts.push(striptags(msg.plainReprompt));
    }

    this.msg.card = msg.card || this.msg.card;
    this.msg.yield = this.msg.yield || !!(msg.ask || msg.tell);
    this.msg.hasAnAsk = this.msg.hasAnAsk || !!msg.ask;

    msg.supportDisplayInterface = msg.supportDisplayInterface ||
      hasSupportForDisplay(this.alexaEvent);

    this.msg.directives = this.msg.directives
    .concat(cannonicalizeDirectives(this.alexaEvent, msg));
    return this;
  }

  appendReply(reply) {
    this.msg.statements = _.concat(this.msg.statements, reply.msg.statements);
    this.msg.reprompts = _.concat(this.msg.reprompts, reply.msg.reprompts);
    this.msg.plainStatements = _.concat(this.msg.plainStatements, reply.msg.plainStatements);
    this.msg.plainReprompts = _.concat(this.msg.plainReprompts, reply.msg.plainReprompts);


    this.msg.yield = this.msg.yield || reply.isYielding();
    this.msg.hasAnAsk = this.msg.hasAnAsk || reply.msg.hasAnAsk;

    reply.supportDisplayInterface = reply.supportDisplayInterface ||
      hasSupportForDisplay(this.alexaEvent);

    this.msg.reprompt = reply.msg.reprompt || this.msg.reprompt;
    this.msg.card = reply.msg.card || this.msg.card;
    this.msg.directives = this.msg.directives
    .concat(cannonicalizeDirectives(this.alexaEvent, reply.msg));

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

function hasSupportForDisplay(alexaEvent) {
  return _.get(alexaEvent, 'context.System.device.supportedInterfaces.Display');
}

function cannonicalizeDirectives(alexaEvent, msg) {
  let directives = msg.directives;
  if (!directives) return [];
  if (!_.isArray(directives)) directives = [directives];

  directives = directives
  .filter(directive => filterDisplayInterface(alexaEvent, directive, msg))
  .map(cannonicalizeDirective);

  if (_.filter(directives, { type: 'Display.RenderTemplate' }).length > 1) {
    throw new Error('At most one Display.RenderTemplate directive can be specified in a response');
  }

  if (_.filter(directives, { type: 'Hint' }).length > 1) {
    throw new Error('At most one Hint directive can be specified in a response');
  }

  if (_.find(directives, { type: 'AudioPlayer.Play' }) && _.find(directives, { type: 'VideoApp.Launch' })) {
    throw new Error('Do not include both an AudioPlayer.Play directive and a VideoApp.Launch directive in the same response');
  }

  return directives;
}

function filterDisplayInterface(alexaEvent, directive, msg) {
  if (!msg.supportDisplayInterface && _.includes(['Display.RenderTemplate', 'Hint'], directive.type)) return false;
  return true;
}

function cannonicalizeDirective(directive) {
  // Custom hint directive
  if (_.isString(directive.hint) && !_.isEmpty(directive.hint)) {
    return {
      type: 'Hint',
      hint: {
        type: 'PlainText',
        text: directive.hint,
      },
    };
  }

  // Custom play directive
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
