/**
 * Alexa State Machine
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

var exports = module.exports = {};

/*
 * Alexa state machine version
 */

exports.version = '0.1.0';

var stateMachineSkill = require('./lib/StateMachineSkill');
exports.stateMachineSkill = stateMachineSkill;

var stateMachine = require('./lib/StateMachine');
exports.stateMachine = stateMachine;

exports.replyWith = stateMachineSkill.replyWith;

var helpers = require('alexa-helpers');
exports.helpers = helpers;
