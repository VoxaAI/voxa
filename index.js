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

const CortanaPlatform = require('./lib/src/platforms/cortana/CortanaPlatform').CortanaPlatform;

const AlexaDirectives = require('./lib/src/platforms/alexa/directives');
const DialogFlowDirectives = require('./lib/src/platforms/dialog-flow/directives');
const CortanaDirectives = require('./lib/src/platforms/cortana/directives');


module.exports = VoxaApp;

module.exports.Alexa = require('./lib/src/platforms/alexa/AlexaPlatform').AlexaPlatform;
module.exports.Alexa.DisplayTemplate = require('./lib/src/platforms/alexa/DisplayTemplateBuilder').DisplayTemplate;
module.exports.Alexa.RenderTemplate = AlexaDirectives.RenderTemplate;
module.exports.Alexa.AccountLinkingCard = AlexaDirectives.AccountLinkingCard;
module.exports.Alexa.PlayAudio = AlexaDirectives.PlayAudio;
module.exports.Alexa.StopAudio = AlexaDirectives.StopAudio;
module.exports.Alexa.DialogDelegate = AlexaDirectives.DialogDelegate;
module.exports.Alexa.HomeCard = AlexaDirectives.HomeCard;

module.exports.DialogFlow = require('./lib/src/platforms/dialog-flow/DialogFlowPlatform').DialogFlowPlatform;
module.exports.DialogFlow.List = DialogFlowDirectives.List;
module.exports.DialogFlow.Suggestions = DialogFlowDirectives.Suggestions;
module.exports.DialogFlow.BasicCard = DialogFlowDirectives.BasicCard;

module.exports.Cortana = CortanaPlatform;
module.exports.Cortana.HeroCard = CortanaDirectives.HeroCard;
module.exports.Cortana.SuggestedActions = CortanaDirectives.SuggestedActions;
module.exports.Cortana.AudioCard = CortanaDirectives.AudioCard;

module.exports.Renderer = require('./lib/src/renderers/Renderer').Renderer

module.exports.version = packageInfo.version;

module.exports.plugins = {
  replaceIntent,
  stateFlow,
  autoLoad,
};
