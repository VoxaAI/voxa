'use strict';

/**
 * Auto load adapter for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

class AutoLoadAdapter {
  get() {
    return new Promise(this);
  }

  put() {
    return new Promise(this);
  }
}

module.exports = AutoLoadAdapter;
