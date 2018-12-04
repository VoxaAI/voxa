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

import { IBag, IVoxaEvent } from "./VoxaEvent";

export interface IVoxaReply {
  hasMessages: boolean;
  hasDirectives: boolean;
  hasTerminated: boolean;

  /**
   * empty the reply
   */
  clear: () => void;

  /**
   * end the conversation
   */
  terminate: () => void;

  /**
   * will return the ssml
   */
  speech: string;
  reprompt?: string;

  /**
   * should return plain text for platforms that support it,
   * for example microsoft bot framework chat, dialog flow
   */
  plain?: string;

  /**
   * adds an SSML or plain statement
   */
  addStatement: (statement: string, isPlain?: boolean) => void;

  /**
   * adds an SSML or plain statement
   */
  addReprompt: (statement: string) => void;

  hasDirective: (type: string | RegExp) => boolean;

  /**
   *  saveSession should store the attributes object into a storage that is scoped to the session.
   *  Attributes stored to the session should be made available in the platform's subsequent event
   *  under `event.session.attributes`. In this way, devs can use the session carry data forward
   *  through the conversation.
   */
  saveSession: (attributes: IBag, event: IVoxaEvent) => Promise<void>;
}

export function addToSSML(ssml: string|undefined, statement: string): string {
  ssml = ssml || "";
  const base = ssml.replace(/^<speak>([\s\S]*)<\/speak>$/g, "$1");
  if (!base) {
    return `<speak>${statement}</speak>`;
  }

  return `<speak>${base}\n${statement}</speak>`;
}

export function addToText(text: string|undefined, statement: string): string {
  if (!text) {
    return statement;
  }

  return `${text} ${statement}`;
}
