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

import {
  FACEBOOK_WEBVIEW_HEIGHT_RATIO,
  IFacebookElementTemplate,
  IFacebookGenericButtonTemplate,
} from "../../directives";

/**
 * Template Builder class reference
 */
export class FacebookElementTemplateBuilder {
  private buttons: IFacebookGenericButtonTemplate[] = [];
  private imageUrl?: string;
  private subtitle?: string;
  private title: string = "";
  private defaultActionUrl?: string;
  private defaultActionFallbackUrl?: string;
  private defaultMessengerExtensions?: boolean;
  private defaultWebviewHeightRatio?: FACEBOOK_WEBVIEW_HEIGHT_RATIO;
  private sharable?: boolean;

  public addButton(button: IFacebookGenericButtonTemplate): FacebookElementTemplateBuilder {
    this.buttons.push(button);

    return this;
  }

  public setImageUrl(imageUrl: string): FacebookElementTemplateBuilder {
    this.imageUrl = imageUrl;

    return this;
  }

  public setSubtitle(subtitle: string): FacebookElementTemplateBuilder {
    this.subtitle = subtitle;

    return this;
  }

  public setTitle(title: string): FacebookElementTemplateBuilder {
    this.title = title;

    return this;
  }

  public setDefaultActionUrl(defaultActionUrl: string): FacebookElementTemplateBuilder {
    this.defaultActionUrl = defaultActionUrl;

    return this;
  }

  public setDefaultActionFallbackUrl(defaultActionFallbackUrl: string): FacebookElementTemplateBuilder {
    this.defaultActionFallbackUrl = defaultActionFallbackUrl;

    return this;
  }

  public setDefaultMessengerExtensions(defaultMessengerExtensions: boolean): FacebookElementTemplateBuilder {
    this.defaultMessengerExtensions = defaultMessengerExtensions;

    return this;
  }

  public setDefaultWebviewHeightRatio(
    defaultWebviewHeightRatio: FACEBOOK_WEBVIEW_HEIGHT_RATIO,
  ): FacebookElementTemplateBuilder {
    this.defaultWebviewHeightRatio = defaultWebviewHeightRatio;

    return this;
  }

  public setSharable(sharable: boolean): FacebookElementTemplateBuilder {
    this.sharable = sharable;

    return this;
  }

  public build(): IFacebookElementTemplate {
    const template: IFacebookElementTemplate = {
      buttons: this.buttons,
      defaultActionFallbackUrl: this.defaultActionFallbackUrl,
      defaultActionUrl: this.defaultActionUrl,
      defaultMessengerExtensions: this.defaultMessengerExtensions,
      defaultWebviewHeightRatio: this.defaultWebviewHeightRatio,
      imageUrl: this.imageUrl,
      sharable: this.sharable,
      subtitle: this.subtitle,
      title: this.title,
    };

    return _.omitBy(template, _.isNil) as IFacebookElementTemplate;
  }
}
