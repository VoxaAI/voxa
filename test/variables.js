'use strict';

/**
 * Variables for tests
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

const Promise = require('bluebird');

const variables = {
  exitDirectiveMessage: function exitDirectiveMessage() {
    return ({
      text: 'Thanks for playing!',
      type: 'PlainText',
    });
  },
  exitCard: function exitCard() {
    return {
      type: 'Standard',
      title: 'title',
      text: 'text',
      image: {
        smallImageUrl: 'smallImage.jpg',
        largeImageUrl: 'largeImage.jpg',
      },
    };
  },
  exitArray: function exitArray() {
    return [{ a: 1 }, { b: 2 }, { c: 3 }];
  },
  items(model) {
    return model.items;
  },
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
    return Promise.resolve(model.count);
  },

  numberOne: function numberOne(model, request) {
    if (request.request.locale === 'en-us') {
      return 'one';
    } else if (request.request.locale === 'de-de') {
      return 'ein';
    }

    return 1;
  },
};

module.exports = variables;
