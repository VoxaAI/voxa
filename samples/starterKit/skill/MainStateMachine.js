'use strict';

// Include the state machine module and the replyWith function
var alexa = require('alexa-statemachine'), replyWith = alexa.replyWith
  ;

module.exports = new alexa.stateMachine({
  openIntent: 'LaunchIntent',
  states: {
    entry: {
      to: {
        LaunchIntent: 'launch',
        'AMAZON.HelpIntent': 'help',
      },
    },
    launch: {
      enter: function enter(request) {
        return replyWith('Intent.Launch', 'entry', request);
      },
    },
    help: {
      enter: function enter(request) {
        return replyWith('Intent.Help', 'entry', request);
      },
    },
  },
});
