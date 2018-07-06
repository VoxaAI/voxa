"use strict";
/**
 * Voxa
 *
 * Copyright (c) 2018 Rain Agency.
 * Licensed under the MIT license.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var AlexaPlatform_1 = require("./platforms/alexa/AlexaPlatform");
exports.AlexaPlatform = AlexaPlatform_1.AlexaPlatform;
var BotFrameworkPlatform_1 = require("./platforms/botframework/BotFrameworkPlatform");
exports.BotFrameworkPlatform = BotFrameworkPlatform_1.BotFrameworkPlatform;
var DialogFlowPlatform_1 = require("./platforms/dialog-flow/DialogFlowPlatform");
exports.DialogFlowPlatform = DialogFlowPlatform_1.DialogFlowPlatform;
var Renderer_1 = require("./renderers/Renderer");
exports.Renderer = Renderer_1.Renderer;
var VoxaApp_1 = require("./VoxaApp");
exports.VoxaApp = VoxaApp_1.VoxaApp;
var errors_1 = require("./errors");
exports.TimeoutError = errors_1.TimeoutError;
exports.OnSessionEndedError = errors_1.OnSessionEndedError;
exports.UnhandledState = errors_1.UnhandledState;
exports.UnknownState = errors_1.UnknownState;
exports.UnknownRequestType = errors_1.UnknownRequestType;
exports.NotImplementedError = errors_1.NotImplementedError;
const directives_1 = require("./platforms/alexa/directives");
const DisplayTemplateBuilder_1 = require("./platforms/alexa/DisplayTemplateBuilder");
const directives_2 = require("./platforms/botframework/directives");
const BotFrameworkReply_1 = require("./platforms/botframework/BotFrameworkReply");
const directives_3 = require("./platforms/dialog-flow/directives");
const plugins_1 = require("./plugins");
exports.plugins = {
    autoLoad: plugins_1.autoLoad,
    replaceIntent: plugins_1.replaceIntent,
    stateFlow: plugins_1.stateFlow,
};
exports.alexa = {
    AccountLinkingCard: directives_1.AccountLinkingCard,
    DialogDelegate: directives_1.DialogDelegate,
    DisplayTemplate: DisplayTemplateBuilder_1.DisplayTemplate,
    HomeCard: directives_1.HomeCard,
    PlayAudio: directives_1.PlayAudio,
    RenderTemplate: directives_1.RenderTemplate,
    StopAudio: directives_1.StopAudio,
};
exports.botframework = {
    AudioCard: directives_2.AudioCard,
    BotFrameworkReply: BotFrameworkReply_1.BotFrameworkReply,
    HeroCard: directives_2.HeroCard,
    SigninCard: directives_2.SigninCard,
    SuggestedActions: directives_2.SuggestedActions,
};
exports.dialogFlow = {
    AccountLinkingCard: directives_3.AccountLinkingCard,
    BasicCard: directives_3.BasicCard,
    Carousel: directives_3.Carousel,
    List: directives_3.List,
    MediaResponse: directives_3.MediaResponse,
    Suggestions: directives_3.Suggestions,
};
//# sourceMappingURL=main.js.map