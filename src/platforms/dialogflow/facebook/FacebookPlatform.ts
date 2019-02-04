/*
 * Copyright (c) 2019 Rain Agency <contact@rain.agency>
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
import { IDirectiveClass } from "../../../directives";
import { DialogflowPlatform } from "../DialogflowPlatform";
import {
  FACEBOOK_BUTTONS,
  FACEBOOK_IMAGE_ASPECT_RATIO,
  FACEBOOK_TOP_ELEMENT_STYLE,
  FACEBOOK_WEBVIEW_HEIGHT_RATIO,
  FacebookAccountLink,
  FacebookAccountUnlink,
  FacebookButtonTemplate,
  FacebookCarousel,
  FacebookList,
  FacebookOpenGraphTemplate,
  FacebookQuickReplyLocation,
  FacebookQuickReplyPhoneNumber,
  FacebookQuickReplyText,
  FacebookQuickReplyUserEmail,
  FacebookSuggestionChips,
  IFacebookElementTemplate,
  IFacebookGenericButtonTemplate,
  IFacebookPayloadTemplate,
  IFacebookQuickReply,
} from "./directives";
import { FacebookEvent } from "./FacebookEvent";
import { FacebookReply } from "./FacebookReply";

export class FacebookPlatform extends DialogflowPlatform {
  protected EventClass = FacebookEvent;

  protected getReply(event: FacebookEvent) {
    return new FacebookReply(event);
  }

  protected getDirectiveHandlers(): IDirectiveClass[] {
    return [
      FacebookAccountLink,
      FacebookAccountUnlink,
      FacebookButtonTemplate,
      FacebookCarousel,
      FacebookList,
      FacebookOpenGraphTemplate,
      FacebookQuickReplyLocation,
      FacebookQuickReplyPhoneNumber,
      FacebookQuickReplyText,
      FacebookQuickReplyUserEmail,
      FacebookSuggestionChips,
    ];
  }
}
