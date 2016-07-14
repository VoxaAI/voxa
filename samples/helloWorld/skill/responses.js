'use strict';

var responses = function () {

  return {
    Intent: {
    	Launch: {
    		ask: "Welcome to the Alexa Skills Kit, you can say hello",
    		reprompt: "You can say hello"
    	},
    	HelloWorld: {
    		tell: "Hello World!",
    		card: {
    			type: "Simple",
    			title: "Greeter",
    			content: "Hello World!"
    		}
    	},
    	Help: {
    		ask: "You can say hello to me!",
    		reprompt: "You can say hello to me!"
			}
		}
  };

}();
module.exports = responses;
