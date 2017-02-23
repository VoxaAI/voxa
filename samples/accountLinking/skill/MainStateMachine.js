'use strict';

// Include the state machine module and the replyWith function
const alexa = require('alexa-statemachine');
const appId = require('../config').alexa.appId;
const views = require('./views');
const variables = require('./variables');
const states = require('./states');

const skill = new alexa.StateMachineSkill(appId, { variables, views });
states.register(skill);
module.exports = skill;
