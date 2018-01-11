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
const replaceIntent = require('./lib/src/plugins/replace-intent');
const stateFlow = require('./lib/src/plugins/state-flow');
const autoLoad = require('./lib/src/plugins/auto-load');

const CortanaAdapter = require('./lib/src/adapters/cortana/CortanaAdapter').CortanaAdapter;

const AlexaDirectives = require('./lib/src/adapters/alexa/directives');
const DialogFlowDirectives = require('./lib/src/adapters/dialog-flow/directives');
const CortanaDirectives = require('./lib/src/adapters/cortana/directives');


module.exports = VoxaApp;

module.exports.Alexa = require('./lib/src/adapters/alexa/AlexaAdapter').AlexaAdapter;
module.exports.Alexa.DisplayTemplate = require('./lib/src/adapters/alexa/DisplayTemplateBuilder').DisplayTemplate;
module.exports.Alexa.RenderTemplate = AlexaDirectives.RenderTemplate;
module.exports.Alexa.AccountLinkingCard = AlexaDirectives.AccountLinkingCard;
module.exports.Alexa.PlayAudio = AlexaDirectives.PlayAudio;
module.exports.Alexa.DialogDelegate = AlexaDirectives.DialogDelegate;

module.exports.DialogFlow = require('./lib/src/adapters/dialog-flow/DialogFlowAdapter').DialogFlowAdapter;
module.exports.DialogFlow.List = DialogFlowDirectives.List;
module.exports.DialogFlow.Suggestions = DialogFlowDirectives.Suggestions;
module.exports.DialogFlow.BasicCard = DialogFlowDirectives.BasicCard;

module.exports.Cortana = CortanaAdapter;
module.exports.Cortana.HeroCard = CortanaDirectives.HeroCard;
module.exports.Cortana.SuggestedActions = CortanaDirectives.SuggestedActions;

module.exports.Renderer = require('./lib/src/renderers/Renderer').Renderer

module.exports.version = packageInfo.version;

module.exports.plugins = {
  replaceIntent,
  stateFlow,
  autoLoad,
};
