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

const packageInfo = require('./package.json');
const StateMachineApp = require('./lib/StateMachineApp');
const helpers = require('alexa-helpers');
const Reply = require('./lib/VoxaReply');
const DefaultRenderer = require('./lib/renderers/DefaultRenderer');

/**
 * Plugins
 */
const badResponseReprompt = require('./lib/plugins/reprompt-on-bad-response');
const replaceIntent = require('./lib/plugins/replace-intent');
const stateFlow = require('./lib/plugins/state-flow');
const cloudWatch = require('./lib/plugins/cloud-watch');
const autoLoad = require('./lib/plugins/auto-load');


module.exports = StateMachineApp;
module.exports.version = packageInfo.version;
module.exports.Reply = Reply;
module.exports.helpers = helpers;


module.exports.plugins = {
  badResponseReprompt,
  replaceIntent,
  stateFlow,
  cloudWatch,
  autoLoad,
};

