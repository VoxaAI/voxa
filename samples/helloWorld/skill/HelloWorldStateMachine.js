'use strict';

// Include the state machine module and the replyWith function
var alexa = require('alexa-statemachine')
    , replyWith = alexa.replyWith
  ;

module.exports = new alexa.stateMachine({
	openIntent: 'HelloWorldIntent',
	states: {
		entry: {
			to: {
				LaunchIntent: 'launch',
				HelloWorldIntent: 'helloWorld',
				"AMAZON.HelpIntent": 'help'
			},
			launch: {
				enter: function enter(request) {
					return replyWith('Intent.Launch', 'helloWorld', request);
				}
			},
			helloWorld: {
				enter: function enter(request) {
					return replyWith('Intent.helloWorld', 'die', request);
				}
			},
			help: {
				enter: function enter(request) {
					return replyWith('Intent.Help', 'die', request);
				}
			}
		}
	}
});
