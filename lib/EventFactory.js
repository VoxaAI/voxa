'use strict';

const _ = require('lodash');
const debug = require('debug')('voxa');

const AlexaEvent = require('./alexa/AlexaEvent');
const ApiAiEvent = require('./apiai/ApiAiEvent');

class EventFactory {
  static makeEventObject(rawEvent) {
    if (rawEvent.request) {
      debug('AlexaEvent');
      return new AlexaEvent(rawEvent);
    }

    debug('ApiAiEvent');
    return new ApiAiEvent(rawEvent);
  }
}


module.exports = EventFactory;
