'use strict';

const views = (function views() {
  return {
    'en-us': {
      translation: {
        LaunchIntent: {
          OpenResponse: { tell: 'Hello! Good {time}' },
        },
        RandomResponse: {
          tell: [
            'Random1',
            'Random2',
            'Random3',
            'Random4',
          ],
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
        Say: {
          Say: { say: 'say' },
        },
        HelpIntent: {
          HelpAboutSkill: { tell: 'For more help visit www.rain.agency' },
        },
        Count: {
          Say: { say: '{count}' },
          Tell: { tell: '{count}' },
        },
      },
    },
    'de-de': {
      translation: {
        LaunchIntent: {
          OpenResponse: { tell: 'Hallo! guten {time}' },
        },
        RandomResponse: {
          tell: [
            'zufällig1',
            'zufällig2',
            'zufällig3',
            'zufällig4',
            'zufällig5',
          ],
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
        Say: {
          Say: { say: 'sagen' },
        },
      },
    },
  };
}());

module.exports = views;
