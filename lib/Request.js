'use strict';

const _ = require('lodash');

class Request {
  constructor(event, lambdaContext) {
    _.merge(this, {
      session: {
        attributes: { },
      },
    }, event);
    this.lambdaContext = lambdaContext;
  }

  get intentParams() {
    return _(this.request.intent.slots)
      .map(s => [s.name, s.value])
      .fromPairs()
      .value();
  }
}

module.exports = Request;
