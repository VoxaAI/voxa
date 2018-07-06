/**
 * Voxa
 *
 * Copyright (c) 2018 Rain Agency.
 * Licensed under the MIT license.
 */
export { AlexaPlatform } from "./platforms/alexa/AlexaPlatform";
export { BotFrameworkPlatform } from "./platforms/botframework/BotFrameworkPlatform";
export { DialogFlowPlatform } from "./platforms/dialog-flow/DialogFlowPlatform";
export { Renderer } from "./renderers/Renderer";
export { VoxaApp } from "./VoxaApp";
export { TimeoutError, OnSessionEndedError, UnhandledState, UnknownState, UnknownRequestType, NotImplementedError, } from "./errors";
import { AccountLinkingCard as AlexaAccountLinkingCard, DialogDelegate, HomeCard, PlayAudio, RenderTemplate, StopAudio } from "./platforms/alexa/directives";
import { DisplayTemplate } from "./platforms/alexa/DisplayTemplateBuilder";
import { AudioCard, HeroCard, SigninCard, SuggestedActions } from "./platforms/botframework/directives";
import { BotFrameworkReply } from "./platforms/botframework/BotFrameworkReply";
import { AccountLinkingCard as DialogFlowAccountLinkingCard, BasicCard, Carousel, List, MediaResponse, Suggestions } from "./platforms/dialog-flow/directives";
import { autoLoad, replaceIntent, stateFlow } from "./plugins";
export declare const plugins: {
    autoLoad: typeof autoLoad;
    replaceIntent: typeof replaceIntent;
    stateFlow: typeof stateFlow;
};
export declare const alexa: {
    AccountLinkingCard: typeof AlexaAccountLinkingCard;
    DialogDelegate: typeof DialogDelegate;
    DisplayTemplate: typeof DisplayTemplate;
    HomeCard: typeof HomeCard;
    PlayAudio: typeof PlayAudio;
    RenderTemplate: typeof RenderTemplate;
    StopAudio: typeof StopAudio;
};
export declare const botframework: {
    AudioCard: typeof AudioCard;
    BotFrameworkReply: typeof BotFrameworkReply;
    HeroCard: typeof HeroCard;
    SigninCard: typeof SigninCard;
    SuggestedActions: typeof SuggestedActions;
};
export declare const dialogFlow: {
    AccountLinkingCard: typeof DialogFlowAccountLinkingCard;
    BasicCard: typeof BasicCard;
    Carousel: typeof Carousel;
    List: typeof List;
    MediaResponse: typeof MediaResponse;
    Suggestions: typeof Suggestions;
};
