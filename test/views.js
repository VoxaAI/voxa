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
    Buttons: { tell: 'Press 2 or up to 4 buttons to wake them up.' },
    ButtonsBye: { tell: 'Thanks for playing with echo buttons.' },
    ButtonsNext: { tell: 'Guess the next pattern.' },
    ISP: {
      Invalid: {
        ask: 'To do In Skill Purchases, you need to link your Amazon account to the US market.',
        reprompt: 'Can you try again?',
      },
      ProductBought: {
        ask: 'Thanks for buying this product, do you want to try it out?',
        reprompt: 'Do you want to try it out?',
      },
      ProductNotBought: {
        tell: 'Thanks for your interest',
      },
    },
    ExitIntent: {
      Farewell: {
        tell: 'Ok. For more info visit {site} site.',
        directives: {
          type: 'Display.RenderTemplate',
          template: {
            type: 'BodyTemplate1',
            backButton: 'HIDDEN',
            backgroundImage: {
              sources: [
                {
                  url: 'https://somesite/show-general.png',
                },
              ],
            },
            // title: 'Skill Exit',
            textContent: {
              primaryText: '{exitDirectiveMessage}',
            },
          },
        },
        card: null,
      },
    },
    HelpIntent: {
      HelpAboutSkill: { tell: 'For more help visit www.rain.agency' },
    },
    Count: {
      Say: { say: '{count}' },
      Tell: { tell: '{count}' },
    },
    BadInput: {
      RepeatLastAskReprompt: { say: 'I\'m sorry. I didn\'t understand.' },
    },
    Playing: {
      SayStop: { ask: 'Say stop if you want to finish the playback', reprompt: 'You can say stop to finish the playback' },
    },
    Random: { tell: ['Random 1', 'Random 2', 'Random 3'] },
  };
}());

module.exports = views;
