'use strict';

class UnhandledState extends Error {
  constructor(alexaEvent, transition, fromState) {
    const message = `${alexaEvent.intent.name} went unhandled on ${fromState} state`;
    super(message);
    this.event = alexaEvent;
    this.name = this.constructor.name;
    this.fromState = fromState;
    this.transition = transition;
    Error.captureStackTrace(this, this.constructor);
  }
}

class UnknownState extends Error {
  constructor(state) {
    const message = `Unknown state ${state}`;
    super(message);
    this.name = this.constructor.name;
    this.state = state;
    Error.captureStackTrace(this, this.constructor);
  }
}

class UnkownRequestType extends Error {
  constructor(requestType) {
    const message = `Unkown request type: ${requestType}`;
    super(message);
    this.name = this.constructor.name;
    this.requestType = requestType;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports.UnhandledState = UnhandledState;
module.exports.UnknownState = UnknownState;
module.exports.UnkownRequestType = UnkownRequestType;
