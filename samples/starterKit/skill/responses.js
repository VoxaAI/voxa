'use strict';

const responses = (function () {
  return {
    Intent: {
      Launch: {
        tell: 'Welcome!',
      },
      Help: {
        say: 'Some help text here.',
      },
    },
  };
}());
module.exports = responses;
