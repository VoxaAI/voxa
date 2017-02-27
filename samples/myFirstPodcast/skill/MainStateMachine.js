'use strict';

// Include the state machine module and the replyWith function
const alexa = require('alexa-statemachine');
const views = require('./views');
const variables = require('./variables');
const states = require('./states');

const skill = new alexa.StateMachineSkill({ variables, views });
states.register(skill);
module.exports = skill;
