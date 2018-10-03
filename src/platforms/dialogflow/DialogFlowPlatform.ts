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
import { DialogFlowEvent } from "./DialogFlowEvent";
import { DialogFlowReply } from "./DialogFlowReply";
import {
  AccountLinkingCard,
  BasicCard,
  BrowseCarousel,
  Carousel,
  Confirmation,
  Context,
  DateTime,
  DeepLink,
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

export class DialogFlowPlatform extends VoxaPlatform {
  public name = "dialogflow";
  protected EventClass = DialogFlowEvent;

  constructor(app: VoxaApp, config: IVoxaPlatformConfig = {}) {
    super(app, config);
    app.onBeforeReplySent(this.saveStorage, true, this.name);
  }

  protected getReply(event: DialogFlowEvent) {
    return new DialogFlowReply(event.google.conv);
  }

  protected saveStorage(
    voxaEvent: IVoxaEvent,
    reply: IVoxaReply,
    transition: ITransition,
  ) {
    const { conv } = (voxaEvent as DialogFlowEvent).google;
    const dialogFlowReply = reply as DialogFlowReply;

    dialogFlowReply.payload.google.userStorage = "{}";
    if (_.isEmpty(conv.user.storage)) {
      dialogFlowReply.payload.google.resetUserStorage = true;
      delete dialogFlowReply.payload.google.userStorage;
    } else {
      dialogFlowReply.payload.google.userStorage = conv.user._serialize();
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
