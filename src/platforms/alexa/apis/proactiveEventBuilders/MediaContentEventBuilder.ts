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

import { EventBuilder } from "./EventBuilder";

/**
 * Media Content Events Builder class reference
 */
export class MediaContentEventBuilder extends EventBuilder {
  public availability: any = {};
  public content: any = {};

  constructor() {
    super("AMAZON.MediaContent.Available");
  }

  public setAvailability(method: MEDIA_CONTENT_METHOD): MediaContentEventBuilder {
    this.availability = {
      method,
      provider: {
        name: "localizedattribute:providerName",
      },
      startTime: new Date().toISOString(),
    };

    return this;
  }

  public setContentType(contentType: MEDIA_CONTENT_TYPE): MediaContentEventBuilder {
    this.content = {
      contentType,
      name: "localizedattribute:contentName",
    };

    return this;
  }

  public getPayload(): any {
    return {
      availability: this.availability,
      content: this.content,
    };
  }
}

export enum MEDIA_CONTENT_METHOD {
  AIR = "AIR",
  DROP = "DROP",
  PREMIERE = "PREMIERE",
  RELEASE = "RELEASE",
  STREAM = "STREAM",
}

export enum MEDIA_CONTENT_TYPE {
  ALBUM = "ALBUM",
  BOOK = "BOOK",
  EPISODE = "EPISODE",
  GAME = "GAME",
  MOVIE = "MOVIE",
  SINGLE = "SINGLE",
}
