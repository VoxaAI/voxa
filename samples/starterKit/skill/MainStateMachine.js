'use strict';

// Include the state machine module and the replyWith function
const alexa = require('alexa-statemachine');
const appId = require('../config').alexa.appId;
const views = require('./views');
const variables = require('./variables');
const Model = require('../services/model');

const skill = new alexa.StateMachineSkill(appId, { variables, views, Model });
module.exports = skill;
