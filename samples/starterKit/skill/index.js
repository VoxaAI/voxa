'use strict';

// Include the state machine module, the state machine,
// the responses and variables to be used in this skill
var alexa = require('alexa-statemachine')
    , sm = require('./MainStateMachine')  
    , appId = require('../config').alexa.appId
    , responses = require('./responses')
    , variables = require('./variables')
  ;

exports.handler = function (event, context) {
  var skill = new alexa.stateMachineSkill(appId, sm, responses, variables);
  console.log(event);
  skill.execute(event, context);
};