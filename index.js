/**
 * Alexa State Machine
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

/*
 * Alexa state machine version
 */

'use strict';

module.exports.version = '0.3.2';

const stateMachineSkill = require('./lib/StateMachineSkill');
const helpers = require('alexa-helpers');
const Reply = require('./lib/Reply');

module.exports.StateMachineSkill = stateMachineSkill;
module.exports.Reply = Reply;
module.exports.helpers = helpers;
module.exports.replyWith = (reply, to) => ({ reply, to });
module.exports.replyWithAudioDirectives = (reply, to, request, data, directives) => ({ reply, to, directives });
