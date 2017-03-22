'use strict';

/**
 * Auto load adapter for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

class AutoLoadAdapter {
  get(user) {
    return new Promise(this);
  }

  put(data) {
    return new Promise(this);
  }
}

module.exports = AutoLoadAdapter;
