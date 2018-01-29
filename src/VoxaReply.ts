/**
 * Voxa Reply
 *
 * See message-renderer to see the response structure that
 * Reply expects.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

import * as bluebird from "bluebird";
import * as debug from "debug";

import { IMessage } from "./renderers/Renderer";
import { IVoxaEvent } from "./VoxaEvent";

const log: debug.IDebugger = debug("voxa");

export interface IVoxaReply {
  hasMessages: boolean;
  hasDirectives: boolean;
  hasTerminated: boolean;

  // empty the reply
  clear: () => void;

  // end the conversation
  terminate: () => void;

  // will return the ssml
  speech: string;
  reprompt?: string;

  // should return plain text for platforms that support it,
  // for example microsoft bot framework chat, dialog flow
  plain?: string;

  // adds an SSML or plain statement
  addStatement: (statement: string, isPlain?: boolean) => void;

  // adds an SSML or plain statement
  addReprompt: (statement: string) => void;

  hasDirective: (type: string | RegExp) => boolean;
    // return this.response.directives.some((directive: any) => {
      // if (_.isRegExp(type)) { return !!type.exec(directive.type); }
      // if (_.isString(type)) { return type === directive.type; }
      // if (_.isFunction(type)) { return type(directive); }
      // throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
    // });
  // }
}

export function addToSSML(ssml: string, statement: string): string {
  const base = ssml.replace(/^<speak>(.*)<\/speak>$/g,  "$1");
  if (!base) {
    return `<speak>${statement}</speak>`;
  }

  return `<speak>${base} ${statement}</speak>`;
}

export function addToText(text: string, statement: string): string {
  return `${text} ${statement}`;
}
