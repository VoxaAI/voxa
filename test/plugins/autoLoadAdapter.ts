"use strict";

/**
 * Auto load adapter for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

export class AutoLoadAdapter {
  public get() {
    return Promise.resolve({});
  }

  public put() {
    return Promise.resolve({});
  }
}
