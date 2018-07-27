'use strict';

const _ = require('lodash');

class GameEngine {

  setEvents(...eventArray) {
    this.events = this.events || {};

    _.forEach(eventArray, (event) => {
      if (event instanceof EventsBuilder) {
        this.events = _.merge(this.events, event.build());
      } else {
        this.events = _.merge(this.events, event);
      }
    });

    return this;
  }

  setRecognizers(...recognizerArray) {
    this.recognizers = this.recognizers || {};

    _.forEach(recognizerArray, (recognizer) => {
      if (recognizer instanceof RecognizerBuilder) {
        this.recognizers = _.merge(this.recognizers, recognizer.build());
      } else {
        this.recognizers = _.merge(this.recognizers, recognizer);
      }
    });

    return this;
  }

  static getEventsBuilder(name) {
    return new EventsBuilder(name);
  }

  static getDeviationRecognizerBuilder(name) {
    return new DeviationRecognizerBuilder(name);
  }

  static getPatternRecognizerBuilder(name) {
    return new PatternRecognizerBuilder(name);
  }

  static getProgressRecognizerBuilder(name) {
    return new ProgressRecognizerBuilder(name);
  }

  startInputHandler(timeout, proxies) {
    return {
      type: 'GameEngine.StartInputHandler',
      timeout,
      proxies,
      recognizers: this.recognizers,
      events: this.events,
    };
  }

  static stopInputHandler(originatingRequestId) {
    return {
      type: 'GameEngine.StopInputHandler',
      originatingRequestId,
    };
  }
}

class RecognizerBuilder {

  constructor(recognizerName, type) {
    this.recognizers = {};
    this.recognizerName = recognizerName;
    this.recognizers[recognizerName] = { type };
  }

  setProperty(property) {
    this.recognizers[this.recognizerName] = _.merge(
      this.recognizers[this.recognizerName],
      property);
  }

  build() {
    return this.recognizers;
  }
}

class DeviationRecognizerBuilder extends RecognizerBuilder {

  constructor(name) {
    super(name, 'deviation');
  }

  recognizer(recognizer) {
    this.setProperty({ recognizer });
    return this;
  }
}

class PatternRecognizerBuilder extends RecognizerBuilder {

  constructor(name) {
    super(name, 'match');
  }

  anchor(anchor) {
    this.setProperty({ anchor });
    return this;
  }

  fuzzy(fuzzy) {
    this.setProperty({ fuzzy });
    return this;
  }

  gadgetIds(gadgetIds) {
    this.setProperty({ gadgetIds });
    return this;
  }

  actions(actions) {
    this.setProperty({ actions });
    return this;
  }

  pattern(pattern) {
    this.setProperty({ pattern });
    return this;
  }
}

class ProgressRecognizerBuilder extends RecognizerBuilder {

  constructor(name) {
    super(name, 'progress');
  }

  recognizer(recognizer) {
    this.setProperty({ recognizer });
    return this;
  }

  completion(completion) {
    this.setProperty({ completion });
    return this;
  }
}

class EventsBuilder {

  constructor(eventName) {
    this.events = {};
    this.eventName = eventName;
  }

  setProperty(property) {
    this.events[this.eventName] = _.merge(this.events[this.eventName], property);
    return this;
  }

  meets(meets) {
    this.setProperty({ meets });
    return this;
  }

  fails(fails) {
    this.setProperty({ fails });
    return this;
  }

  reports(reports) {
    this.setProperty({ reports });
    return this;
  }

  shouldEndInputHandler(shouldEndInputHandler) {
    this.setProperty({ shouldEndInputHandler });
    return this;
  }

  maximumInvocations(maximumInvocations) {
    this.setProperty({ maximumInvocations });
    return this;
  }

  triggerTimeMilliseconds(triggerTimeMilliseconds) {
    this.setProperty({ triggerTimeMilliseconds });
    return this;
  }

  build() {
    return this.events;
  }
}

module.exports = GameEngine;
module.exports.EVENT_REPORT_ENUM = {
  HISTORY: 'history',
  MATCHES: 'matches',
  NOTHING: 'nothing',
};
module.exports.ANCHOR_ENUM = {
  START: 'start',
  END: 'end',
  ANYWHERE: 'anywhere',
};
