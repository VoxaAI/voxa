/**
 * Voxa
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

'use strict';

const packageInfo = require('./package.json');
const VoxaApp = require('./lib/VoxaApp').VoxaApp;

/**
 * Plugins
 */
const replaceIntent = require('./lib/plugins/replace-intent');
const stateFlow = require('./lib/plugins/state-flow');
const autoLoad = require('./lib/plugins/auto-load');

const CortanaAdapter = require('./lib/adapters/cortana/CortanaAdapter').CortanaAdapter;

const AlexaDirectives = require('./lib/adapters/alexa/directives');
const DialogFlowDirectives = require('./lib/adapters/dialog-flow/directives');
const CortanaDirectives = require('./lib/adapters/cortana/directives');


module.exports = VoxaApp;

module.exports.Alexa = require('./lib/adapters/alexa/AlexaAdapter').AlexaAdapter;
module.exports.Alexa.DisplayTemplate = require('./lib/adapters/alexa/DisplayTemplateBuilder').DisplayTemplate;
module.exports.Alexa.RenderTemplate = AlexaDirectives.RenderTemplate;
module.exports.Alexa.AccountLinkingCard = AlexaDirectives.AccountLinkingCard;
module.exports.Alexa.PlayAudio = AlexaDirectives.PlayAudio;
module.exports.Alexa.DialogDelegate = AlexaDirectives.DialogDelegate;

module.exports.DialogFlow = require('./lib/adapters/dialog-flow/DialogFlowAdapter').DialogFlowAdapter;
module.exports.DialogFlow.List = DialogFlowDirectives.List;
module.exports.DialogFlow.Suggestions = DialogFlowDirectives.Suggestions;
module.exports.DialogFlow.BasicCard = DialogFlowDirectives.BasicCard;

module.exports.Cortana = CortanaAdapter;
module.exports.Cortana.HeroCard = CortanaDirectives.HeroCard;
module.exports.Cortana.SuggestedActions = CortanaDirectives.SuggestedActions;

module.exports.Renderer = require('./lib/renderers/Renderer').Renderer

module.exports.version = packageInfo.version;

module.exports.plugins = {
  replaceIntent,
  stateFlow,
  autoLoad,
};
