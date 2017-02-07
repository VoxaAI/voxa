'use strict';

/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

const variables = {
  time: function time() {
    const today = new Date();
    const curHr = today.getHours();

    if (curHr < 12) {
      return 'Morning';
    }
    if (curHr < 18) {
      return 'Afternoon';
    }
    return 'Evening';
  },

  site: function site() {
    return 'example.com';
  },

  count: function count(model) {
    return model.count;
  },
};

module.exports = variables;

