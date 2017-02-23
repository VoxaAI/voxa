'use strict';

const authCard = { type: 'LinkAccount' };
const responses = (function responses() {
  return {
    Intent: {
      Launch: {
        ask: 'Welcome {user}! You are authenticated.',
        reprompt: 'You can continue adding more features to this sample',
      },
      NotAuthenticated: {
        tell: 'Hello! It seems you have not gone through the account linking process. I just sent you a card to the Alexa app so you enter your credentials.',
        card: authCard,
      },
      Help: {
        ask: 'Some help text here.',
      },
    },
  };
}());
module.exports = responses;
