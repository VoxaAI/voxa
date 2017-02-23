'use strict';

class UnhandledState extends Error {
  constructor(transition, fromState) {
    const message = `Transition from ${fromState} resulted in ${transition}`;
    super(message);
    this.name = this.constructor.name;
    this.fromState = fromState;
    this.transition = transition;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class UnknownState extends Error {
  constructor(state) {
    const message = `Unknown state ${state}`;
    super(message);
    this.name = this.constructor.name;
    this.state = state;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

class UnkownRequestType extends Error {
  constructor(requestType) {
    const message = `Unkown request type: ${requestType}`;
    super(message);
    this.name = this.constructor.name;
    this.requestType = requestType;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error(message)).stack;
    }
  }
}

module.exports.UnhandledState = UnhandledState;
module.exports.UnknownState = UnknownState;
module.exports.UnkownRequestType = UnkownRequestType;
