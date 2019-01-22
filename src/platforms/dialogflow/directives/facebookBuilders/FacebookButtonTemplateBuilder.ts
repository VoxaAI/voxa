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
  IFacebookGenericButtonTemplate,
} from "../../directives";

/**
 * Template Builder class reference
 */
export class FacebookButtonTemplateBuilder {
  private fallbackUrl: string|undefined;
  private messengerExtensions: boolean|undefined;
  private payload: string|undefined;
  private title: string = "";
  private type: string = "";
  private url: string|undefined;
  private webviewHeightRatio: FACEBOOK_WEBVIEW_HEIGHT_RATIO|undefined;

  public setFallbackUrl(fallbackUrl: string): FacebookButtonTemplateBuilder {
    this.fallbackUrl = fallbackUrl;

    return this;
  }

  public setMessengerExtensions(messengerExtensions: boolean): FacebookButtonTemplateBuilder {
    this.messengerExtensions = messengerExtensions;

    return this;
  }

  public setPayload(payload: string): FacebookButtonTemplateBuilder {
    this.payload = payload;

    return this;
  }

  public setTitle(title: string): FacebookButtonTemplateBuilder {
    this.title = title;

    return this;
  }

  public setType(type: string): FacebookButtonTemplateBuilder {
    this.type = type;

    return this;
  }

  public setUrl(url: string): FacebookButtonTemplateBuilder {
    this.url = url;

    return this;
  }

  public setWebviewHeightRatio(webviewHeightRatio: FACEBOOK_WEBVIEW_HEIGHT_RATIO): FacebookButtonTemplateBuilder {
    this.webviewHeightRatio = webviewHeightRatio;

    return this;
  }

  public build(): IFacebookGenericButtonTemplate {
    const template: IFacebookGenericButtonTemplate = {
      fallbackUrl: this.fallbackUrl,
      messengerExtensions: this.messengerExtensions,
      payload: this.payload,
      title: this.title,
      type: this.type,
      url: this.url,
      webviewHeightRatio: this.webviewHeightRatio,
    };

    return _.omitBy(template, _.isNil) as IFacebookGenericButtonTemplate;
  }
}
