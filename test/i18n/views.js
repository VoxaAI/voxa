'use strict';

const views = (function views() {
  return {
    'en-us': {
      translation: {
        LaunchIntent: {
          OpenResponse: { tell: 'Hello! Good {time}' },
        },
        Question: {
          Ask: { ask: 'What time is it?' },
        },
        ExitIntent: {
          Farewell: { tell: 'Ok. For more info visit {site} site.' },
        },
        Number: {
          One: { tell: '{numberOne}' },
        },
      },
    },
    'de-de': {
      translation: {
        LaunchIntent: {
          OpenResponse: { tell: 'Hallo! guten {time}' },
        },
        Question: {
          Ask: { ask: 'wie spät ist es?' },
        },
        ExitIntent: {
          Farewell: { tell: 'Ok für weitere Infos besuchen {site} Website' },
        },
        Number: {
          One: { tell: '{numberOne}' },
        },
      },
    },
  };
}());

module.exports = views;
