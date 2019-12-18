/**
 * Voxa
 *
 * Copyright (c) 2018 Rain Agency.
 * Licensed under the MIT license.
 */

export { Tell, Say, SayP, Ask, Reprompt } from "./directives";
export { VoxaPlatform } from "./platforms";
export {
  IVoxaEvent,
  IVoxaIntentEvent,
  IVoxaIntent,
  IVoxaUserProfile,
  VoxaEvent
} from "./VoxaEvent";
export { IVoxaReply } from "./VoxaReply";
export {
  AlexaReply,
  AlexaPlatform,
  AccountLinkingCard as AlexaAccountLinkingCard,
  AlexaEvent,
  APLCommand,
  APLTemplate,
  APLTTemplate,
  APLTCommand,
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
  IVoxaAlexaUserProfile,
  PlayAudio,
  ReminderBuilder,
  RenderTemplate,
  StopAudio,
  TRIGGER_EVENT_ENUM,
  Hint
} from "./platforms/alexa";
export {
  EventBuilder,
  GARBAGE_COLLECTION_DAY,
  GARBAGE_TYPE,
  IMessageRequest,
  MEDIA_CONTENT_METHOD,
  MEDIA_CONTENT_TYPE,
  MediaContentEventBuilder,
  MESSAGE_ALERT_FRESHNESS,
  MESSAGE_ALERT_STATUS,
  MESSAGE_ALERT_URGENCY,
  MessageAlertEventBuilder,
  Messaging,
  OCCASION_CONFIRMATION_STATUS,
  OCCASION_TYPE,
  OccasionEventBuilder,
  ORDER_STATUS,
  OrderStatusEventBuilder,
  ProactiveEvents,
  SOCIAL_GAME_INVITE_TYPE,
  SOCIAL_GAME_OFFER,
  SOCIAL_GAME_RELATIONSHIP_TO_INVITEE,
  SocialGameInviteEventBuilder,
  SportsEventBuilder,
  TrashCollectionAlertEventBuilder,
  WEATHER_ALERT_TYPE,
  WeatherAlertEventBuilder
} from "./platforms/alexa/apis";
export {
  BotFrameworkPlatform,
  AudioCard,
  BotFrameworkEvent,
  BotFrameworkReply,
  HeroCard,
  SigninCard,
  SuggestedActions
} from "./platforms/botframework";
export {
  AccountLinkingCard as DialogflowAccountLinkingCard,
  BasicCard,
  Carousel,
  DialogflowEvent,
  DialogflowReply,
  DialogflowPlatform,
  FacebookButtonTemplateBuilder,
  FacebookElementTemplateBuilder,
  FacebookTemplateBuilder,
  FACEBOOK_ACTIONS,
  FACEBOOK_BUTTONS,
  FACEBOOK_IMAGE_ASPECT_RATIO,
  FACEBOOK_TOP_ELEMENT_STYLE,
  FACEBOOK_USER_FIELDS,
  FACEBOOK_WEBVIEW_HEIGHT_RATIO,
  FacebookAccountLink,
  FacebookAccountUnlink,
  FacebookButtonTemplate,
  FacebookCarousel,
  FacebookEvent,
  FacebookList,
  FacebookPlatform,
  FacebookOpenGraphTemplate,
  FacebookQuickReplyLocation,
  FacebookQuickReplyPhoneNumber,
  FacebookQuickReplyText,
  FacebookQuickReplyUserEmail,
  FacebookReply,
  FacebookSuggestionChips,
  GoogleAssistantEvent,
  GoogleAssistantPlatform,
  IFacebookGenericButtonTemplate,
  IFacebookElementTemplate,
  IFacebookPayloadTemplate,
  IFacebookPlatformConfig,
  IFacebookQuickReply,
  IVoxaFacebookUserProfile,
  IVoxaGoogleUserProfile,
  List,
  MediaResponse,
  Suggestions
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
  SSMLError
} from "./errors";
export { Model } from "./Model";

import { autoLoad, replaceIntent, s3Persistence, stateFlow } from "./plugins";

export { IS3Persistence } from "./plugins";

export const plugins = {
  autoLoad,
  replaceIntent,
  s3Persistence,
  stateFlow
};
