'use strict';

// Include the state machine module, the state machine,
// the responses and variables to be used in this skill
var alexa = require('alexa-statemachine')
    , sm = require('./HelloWorldStateMachine')  
    , responses = require('./responses')
    , variables = require('./variables')
  ;

exports.handler = function (event, context) {
  var skill = new alexa.stateMachineSkill(appId, sm, responses, variables);
  skill.execute(event, context);
};