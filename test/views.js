'use strict';

const views = (function views() {
  return {
    'en-us': {
      translation: {
        LaunchIntent: {
          OpenResponse: {
            tell: 'Hello! Good {time}',
            dialogFlow: {
              tell: 'Hello from DialogFlow',
            },
          },
        },
        RandomResponse: {
          tell: [
            'Random 1',
            'Random 2',
            'Random 3',
            'Random 4',
          ],
        },
        Question: {
          Ask: {
            ask: 'What time is it?',
            reprompt: 'What time is it?',
          },

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
        Playing: {
          SayStop: {
            ask: 'Say stop if you want to finish the playback',
          },
        },
        BadInput: {
          RepeatLastAskReprompt: {
            say: 'I\'m sorry. I didn\'t understand.',
          },
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
    Random: { tell: ['Random 1', 'Random 2', 'Random 3'] },
  };
}());

module.exports = views;
