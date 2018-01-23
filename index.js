/**
 * Voxa
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const packageInfo = require('./package.json');
const VoxaApp = require('./lib/src/VoxaApp').VoxaApp;

/**
 * Plugins
 */
const replaceIntent = require('./lib/src/plugins/replace-intent').register;
const stateFlow = require('./lib/src/plugins/state-flow').register;
const autoLoad = require('./lib/src/plugins/auto-load').autoLoad;

const CortanaAdapter = require('./lib/src/platforms/cortana/CortanaAdapter').CortanaAdapter;

const AlexaDirectives = require('./lib/src/platforms/alexa/directives');
const DialogFlowDirectives = require('./lib/src/platforms/dialog-flow/directives');
const CortanaDirectives = require('./lib/src/platforms/cortana/directives');


module.exports = VoxaApp;

module.exports.Alexa = require('./lib/src/platforms/alexa/AlexaAdapter').AlexaAdapter;
module.exports.Alexa.DisplayTemplate = require('./lib/src/platforms/alexa/DisplayTemplateBuilder').DisplayTemplate;
module.exports.Alexa.renderTemplate = AlexaDirectives.renderTemplate;
module.exports.Alexa.accountLinkingCard = AlexaDirectives.accountLinkingCard;
module.exports.Alexa.playAudio = AlexaDirectives.playAudio;
module.exports.Alexa.dialogDelegate = AlexaDirectives.dialogDelegate;
module.exports.Alexa.homeCard = AlexaDirectives.homeCard;

module.exports.DialogFlow = require('./lib/src/platforms/dialog-flow/DialogFlowAdapter').DialogFlowAdapter;
module.exports.DialogFlow.list = DialogFlowDirectives.list;
module.exports.DialogFlow.suggestions = DialogFlowDirectives.suggestions;
module.exports.DialogFlow.basicCard = DialogFlowDirectives.basicCard;

module.exports.Cortana = CortanaAdapter;
module.exports.Cortana.heroCard = CortanaDirectives.heroCard;
module.exports.Cortana.suggestedActions = CortanaDirectives.suggestedActions;
module.exports.Cortana.audioCard = CortanaDirectives.audioCard;

module.exports.Renderer = require('./lib/src/renderers/Renderer').Renderer

module.exports.version = packageInfo.version;

module.exports.plugins = {
  replaceIntent,
  stateFlow,
  autoLoad,
};
