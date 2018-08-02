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
const StateMachineSkill = require('./lib/StateMachineSkill');
const GadgetController = require('./lib/GadgetController');
const GameEngine = require('./lib/GameEngine');
const Reply = require('./lib/Reply');
const DefaultRenderer = require('./lib/renderers/DefaultRenderer');
const I18NRenderer = require('./lib/renderers/I18NRenderer');

/**
 * Plugins
 */
const replaceIntent = require('./lib/plugins/replace-intent');
const stateFlow = require('./lib/plugins/state-flow');
const cloudWatch = require('./lib/plugins/cloud-watch');
const autoLoad = require('./lib/plugins/auto-load');


module.exports = StateMachineSkill;
module.exports.version = packageInfo.version;
module.exports.GadgetController = GadgetController;
module.exports.GameEngine = GameEngine;
module.exports.Reply = Reply;
module.exports.replyWith = (reply, to) => ({ reply, to });
module.exports.replyWithAudioDirectives = (reply, to, request, data, directives) => ({ reply, to, directives });

module.exports.I18NRenderer = I18NRenderer;
module.exports.DefaultRenderer = DefaultRenderer;

module.exports.plugins = {
  replaceIntent,
  stateFlow,
  cloudWatch,
  autoLoad,
};
