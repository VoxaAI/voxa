'use strict';

const responses = (function responses() {
  return {
    Intent: {
      Launch: {
        tell: 'Welcome {user}!',
      },
      Help: {
        say: 'Some help text here.',
      },
    },
  };
}());
module.exports = responses;
