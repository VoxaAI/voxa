/*
 * Copyright (c) 2018 Rain Agency <contact@rain.agency>
 * Author: Rain Agency <contact@rain.agency>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import * as _ from "lodash";
import { IDirectiveClass } from "../../directives";
import { ITransition } from "../../StateMachine";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
import { IVoxaPlatformConfig, VoxaPlatform } from "../VoxaPlatform";
import { DialogflowEvent } from "./DialogflowEvent";
import { DialogflowReply } from "./DialogflowReply";
import {
  AccountLinkingCard,
  BasicCard,
  BrowseCarousel,
  Carousel,
  Confirmation,
  Context,
  DateTime,
  DeepLink,
  FACEBOOK_IMAGE_ASPECT_RATIO,
  FACEBOOK_TOP_ELEMENT_STYLE,
  FACEBOOK_WEBVIEW_HEIGHT_RATIO,
  FacebookAccountLink,
  FacebookAccountUnlink,
  FacebookButtonTemplate,
  FacebookCarousel,
  FacebookList,
  FacebookQuickReplyLocation,
  FacebookQuickReplyPhoneNumber,
  FacebookQuickReplyText,
  FacebookQuickReplyUserEmail,
  FacebookSuggestionChips,
  IFacebookElementTemplate,
  IFacebookGenericButtonTemplate,
  IFacebookPayloadTemplate,
  IFacebookQuickReply,
  LinkOutSuggestion,
  List,
  MediaResponse,
  NewSurface,
  Permission,
  Place,
  RegisterUpdate,
  Suggestions,
  Table,
  TransactionDecision,
  TransactionRequirements,
  UpdatePermission,
} from "./directives";

export interface IDialogflowPlatformConfig extends IVoxaPlatformConfig {
  clientId?: string; // id used to verify user's identify from Google Sign-In
}

export class DialogflowPlatform extends VoxaPlatform {
  public name = "dialogflow";
  protected EventClass = DialogflowEvent;

  constructor(app: VoxaApp, config: IDialogflowPlatformConfig = {}) {
    super(app, config);
    app.onBeforeReplySent(this.saveStorage, true, this.name);
  }

  protected getReply(event: DialogflowEvent) {
    return new DialogflowReply(event.google.conv);
  }

  protected saveStorage(
    voxaEvent: IVoxaEvent,
    reply: IVoxaReply,
    transition: ITransition,
  ) {
    const { conv } = (voxaEvent as DialogflowEvent).google;
    const dialogflowReply = reply as DialogflowReply;

    if (_.isEmpty(conv.user.storage)) {
      dialogflowReply.payload.google.resetUserStorage = true;
      delete dialogflowReply.payload.google.userStorage;
    } else {
      dialogflowReply.payload.google.userStorage = conv.user._serialize();
    }
  }

  protected getDirectiveHandlers(): IDirectiveClass[] {
    return [
      AccountLinkingCard,
      BasicCard,
      BrowseCarousel,
      Carousel,
      Confirmation,
      DateTime,
      DeepLink,
      FacebookAccountLink,
      FacebookAccountUnlink,
      FacebookButtonTemplate,
      FacebookCarousel,
      FacebookList,
      FacebookQuickReplyLocation,
      FacebookQuickReplyPhoneNumber,
      FacebookQuickReplyText,
      FacebookQuickReplyUserEmail,
      FacebookSuggestionChips,
      LinkOutSuggestion,
      List,
      MediaResponse,
      Permission,
      NewSurface,
      Place,
      RegisterUpdate,
      Suggestions,
      Table,
      TransactionDecision,
      TransactionRequirements,
      UpdatePermission,
      Context,
    ];
  }
}
