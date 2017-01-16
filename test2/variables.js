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
    let timeName;

    if (curHr < 12) {
      timeName = 'Morning';
    } else if (curHr < 18) {
      timeName = 'Afternoon';
    } else {
      timeName = 'Evening';
    }

    return Promise.resolve(timeName);
  },

  site: function site() {
    return Promise.resolve('example.com');
  },
};

module.exports = variables;

