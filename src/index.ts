/**
 * Voxa
 *
 * Copyright (c) 2018 Rain Agency.
 * Licensed under the MIT license.
 */

export { Tell, Say, SayP, Ask, Reprompt } from "./directives";
export { VoxaPlatform } from "./platforms";
export { IVoxaEvent, IVoxaIntentEvent, IVoxaIntent } from "./VoxaEvent";
export { IVoxaReply } from "./VoxaReply";
export {
  AlexaReply,
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
  Hint,
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
  DialogFlowReply,
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
export { ITransition, State } from "./StateMachine";
export {
  TimeoutError,
  OnSessionEndedError,
  UnknownState,
  UnknownRequestType,
  NotImplementedError,
} from "./errors";
export { Model } from "./Model";

import { autoLoad, replaceIntent, stateFlow } from "./plugins";

export const plugins = {
  autoLoad,
  replaceIntent,
  stateFlow,
};
