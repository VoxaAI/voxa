
/**
 * Voxa
 *
 * Copyright (c) 2018 Rain Agency.
 * Licensed under the MIT license.
 */

export { AlexaPlatform } from "./platforms/alexa/AlexaPlatform";
export { BotFrameworkPlatform } from "./platforms/botframework/BotFrameworkPlatform";
export { Renderer } from "./renderers/Renderer";
export { VoxaApp } from "./VoxaApp";

import {
  AccountLinkingCard,
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
  AccountLinkingCard,
  DialogDelegate,
  DisplayTemplate,
  HomeCard,
  PlayAudio,
  RenderTemplate,
  StopAudio,
};

export const botframework = {
  AudioCard,
  HeroCard,
  SigninCard,
  SuggestedActions,
};
