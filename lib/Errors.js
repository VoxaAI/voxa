'use strict';

class BadResponse extends Error {
  constructor(message, fromState) {
    super(message);
    this.name = this.constructor.name;
    this.fromState = fromState;
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

class UnsupportedIntent extends Error {
  constructor(state, intent) {
    const message = `Unsupported intent: ${intent} for state ${state}`;
    super(message);
    this.name = this.constructor.name;
    this.state = state;
    this.intent = intent;
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

module.exports.BadResponse = BadResponse;
module.exports.UnknownState = UnknownState;
module.exports.UnsupportedIntent = UnsupportedIntent;
module.exports.UnkownRequestType = UnkownRequestType;
