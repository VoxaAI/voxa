/**
 * Voxa
 *
 * Copyright (c) 2018 Rain Agency.
 * Licensed under the MIT license.
 */

export { IVoxaEvent, IVoxaIntent } from "./VoxaEvent";
export {
  AlexaPlatform,
  AccountLinkingCard as AlexaAccountLinkingCard,
  AlexaEvent,
  ANCHOR_ENUM,
  ConnectionsSendRequest,
  DialogDelegate,
  DisplayTemplate,
  EVENT_REPORT_ENUM,
  GadgetController,
  GadgetControllerLightDirective,
  GameEngine,
  GameEngineStartInputHandler,
  GameEngineStopInputHandler,
  HomeCard,
  PlayAudio,
  RenderTemplate,
  StopAudio,
  TRIGGER_EVENT_ENUM,
} from "./platforms/alexa";
export {
  BotFrameworkPlatform,
  AudioCard,
  BotFrameworkEvent,
  BotFrameworkReply,
  HeroCard,
  SigninCard,
  SuggestedActions,
} from "./platforms/botframework";
export {
  DialogFlowPlatform,
  AccountLinkingCard as DialogFlowAccountLinkingCard,
  BasicCard,
  Carousel,
  DialogFlowEvent,
  List,
  MediaResponse,
  Suggestions,
} from "./platforms/dialogflow";
export { Renderer } from "./renderers/Renderer";
export { VoxaApp } from "./VoxaApp";
export { ITransition } from "./StateMachine";
export {
  TimeoutError,
  OnSessionEndedError,
  UnhandledState,
  UnknownState,
  UnknownRequestType,
  NotImplementedError,
} from "./errors";

import { autoLoad, replaceIntent, stateFlow } from "./plugins";

export const plugins = {
  autoLoad,
  replaceIntent,
  stateFlow,
};
