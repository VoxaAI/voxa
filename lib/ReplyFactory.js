'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');

const AlexaReply = require('./alexa/AlexaReply');
const ApiAiReply = require('./apiai/ApiAiReply');

const AlexaEvent = require('./alexa/AlexaEvent');
const ApiAiEvent = require('./apiai/ApiAiEvent');

class ReplyFactory {
  static makeReply(voxaEvent, msg) {
    if (voxaEvent instanceof AlexaEvent) {
      debug('AlexaReply');
      return new AlexaReply(voxaEvent, msg);
    }

    debug('ApiAiReply');
    return new ApiAiReply(voxaEvent, msg);
  }
}


module.exports = ReplyFactory;
