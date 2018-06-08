
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
export {
  TimeoutError,
  OnSessionEndedError,
  UnhandledState,
  UnknownState,
  UnknownRequestType,
  NotImplementedError,
} from "./errors";

import {
  AccountLinkingCard as AlexaAccountLinkingCard,
  DialogDelegate,
  HomeCard,
  PlayAudio,
  RenderTemplate,
  StopAudio,
} from "./platforms/alexa/directives";
import { DisplayTemplate } from "./platforms/alexa/DisplayTemplateBuilder";

import {
  AudioCard,
  HeroCard,
  SigninCard,
  SuggestedActions,
} from "./platforms/botframework/directives";

import { BotFrameworkReply } from "./platforms/botframework/BotFrameworkReply";

import {
  AccountLinkingCard as DialogFlowAccountLinkingCard,
  BasicCard,
  Carousel,
  List,
  MediaResponse,
  Suggestions,
} from "./platforms/dialog-flow/directives";

import {
  autoLoad,
  replaceIntent,
  stateFlow,
} from "./plugins";

export const plugins = {
  autoLoad,
  replaceIntent,
  stateFlow,
};

export const alexa = {
  AccountLinkingCard: AlexaAccountLinkingCard,
  DialogDelegate,
  DisplayTemplate,
  HomeCard,
  PlayAudio,
  RenderTemplate,
  StopAudio,
};

export const botframework = {
  AudioCard,
  BotFrameworkReply,
  HeroCard,
  SigninCard,
  SuggestedActions,
};

export const dialogFlow = {
  AccountLinkingCard: DialogFlowAccountLinkingCard,
  BasicCard,
  Carousel,
  List,
  MediaResponse,
  Suggestions,
};
