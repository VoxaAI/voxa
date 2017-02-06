'use strict';

/**
 * Views for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

const views = (function views() {
  return {
    LaunchIntent: {
      OpenResponse: { tell: 'Hello! Good {time}' },
    },
    Question: {
      Ask: { ask: 'What time is it?' },
    },
    ExitIntent: {
      Farewell: { tell: 'Ok. For more info visit {site} site.' },
    },
    HelpIntent: {
      HelpAboutSkill: { tell: 'For more help visit www.rain.agency' },
    },
    Count: {
      Say: { say: '{count}' },
      Tell: { tell: '{count}' },
    },
  };
}());

module.exports = views;

