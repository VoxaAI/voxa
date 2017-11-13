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

/**
 * Plugins
 */
const replaceIntent = require('./lib/plugins/replace-intent');
const stateFlow = require('./lib/plugins/state-flow');
const autoLoad = require('./lib/plugins/auto-load');


module.exports = StateMachineApp;
module.exports.Alexa = require('./lib/adapters/alexa/AlexaAdapter');
module.exports.DialogFlow = require('./lib/adapters/dialog-flow/DialogFlowAdapter');

module.exports.version = packageInfo.version;

module.exports.plugins = {
  replaceIntent,
  stateFlow,
  autoLoad,
};
