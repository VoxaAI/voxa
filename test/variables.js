'use strict';

/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

const Promise = require('bluebird');

const variables = {
  time: function time() {
    const today = new Date();
    const curHr = today.getHours();

    if (curHr < 12) {
      return Promise.resolve('Morning');
    }
    if (curHr < 18) {
      return Promise.resolve('Afternoon');
    }
    return Promise.resolve('Evening');
  },

  site: function site() {
    return Promise.resolve('example.com');
  },

  count: function count(model) {
    return model.count;
  },

  numberOne: function numberOne(model, request) {
    if (request.request.locale === 'en-us') {
      return 'one';
    } else if (request.request.locale === 'de-de') {
      return 'ein';
    }

    return 1;
  },
};

module.exports = variables;

