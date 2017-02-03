'use strict';

// Include the state machine module and the replyWith function
const alexa = require('alexa-statemachine');
const appId = require('../config').alexa.appId;
const views = require('./views');
const variables = require('./variables');
const Model = require('./model');

const skill = new alexa.StateMachineSkill(appId, { openIntent: 'LaunchIntent', variables, views, Model });
module.exports = skill;
