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
  FACEBOOK_IMAGE_ASPECT_RATIO,
  FACEBOOK_TOP_ELEMENT_STYLE,
  IFacebookElementTemplate,
  IFacebookGenericButtonTemplate,
  IFacebookPayloadTemplate,
} from "../../directives";

/**
 * Template Builder class reference
 */
export class FacebookTemplateBuilder {
  private buttons: IFacebookGenericButtonTemplate[] = [];
  private elements: IFacebookElementTemplate[] = [];
  private imageAspectRatio?: FACEBOOK_IMAGE_ASPECT_RATIO;
  private sharable?: boolean;
  private topElementStyle?: FACEBOOK_TOP_ELEMENT_STYLE;

  public addButton(button: IFacebookGenericButtonTemplate): FacebookTemplateBuilder {
    this.buttons.push(button);

    return this;
  }

  public addElement(element: IFacebookElementTemplate): FacebookTemplateBuilder {
    this.elements.push(element);

    return this;
  }

  public setImageAspectRatio(imageAspectRatio: FACEBOOK_IMAGE_ASPECT_RATIO): FacebookTemplateBuilder {
    this.imageAspectRatio = imageAspectRatio;

    return this;
  }

  public setSharable(sharable: boolean): FacebookTemplateBuilder {
    this.sharable = sharable;

    return this;
  }

  public setTopElementStyle(topElementStyle: FACEBOOK_TOP_ELEMENT_STYLE): FacebookTemplateBuilder {
    this.topElementStyle = topElementStyle;

    return this;
  }

  public build(): IFacebookPayloadTemplate {
    const template: IFacebookPayloadTemplate = {
      elements: this.elements,
      imageAspectRatio: this.imageAspectRatio,
      sharable: this.sharable,
      topElementStyle: this.topElementStyle,
    };

    if (!_.isEmpty(this.buttons)) {
      template.buttons = this.buttons;
    }

    return _.omitBy(template, _.isNil) as IFacebookPayloadTemplate;
  }
}
