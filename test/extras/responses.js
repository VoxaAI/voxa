/**
 * Responses for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

var responses = function () {
  return {
    "LaunchIntent": {
      "OpenResponse": { tell: "Hello! Good {time}" }
    },
    "ExitIntent": {
      "Farewell": { tell: "Ok. For more info visit {site} site." }
    }
  }
}();

module.exports = responses;