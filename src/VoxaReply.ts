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
import * as _ from "lodash";
import * as striptags from "striptags";

import { IMessage, Renderer } from "./renderers/Renderer";
import { IVoxaEvent } from "./VoxaEvent";

const log: debug.IDebugger = debug("voxa");

export interface IReply<Reply extends VoxaReply> {
  new(event: IVoxaEvent, renderer: Renderer): Reply;
}

export type directiveHandler = (reply: VoxaReply, event: IVoxaEvent) => Promise<void>;

export interface IDirectiveHandler {
  handler: (value: any) => directiveHandler;
  key?: string;
}

export interface IResponse {
  statements: string[];
  reprompt: string;
  terminate: boolean;
  directives: any[];
  yield: boolean;
}

export abstract class VoxaReply {
  public voxaEvent: IVoxaEvent;
  public session: any;
  public response: IResponse;
  public error?: Error;
  public directiveHandlers: IDirectiveHandler[];
  public renderer: Renderer;

  constructor(voxaEvent: IVoxaEvent, renderer: Renderer) {
    this.voxaEvent = voxaEvent;
    this.session = voxaEvent.session;
    this.directiveHandlers = [];
    this.renderer = renderer;

    this.response = {
      directives: [],
      reprompt: "", // Since only one reprompt is possible, only the latest value is kept
      statements: [], // Statements will be concatenated together before being sent
      terminate: true, // The conversation is over
      yield: false, // The conversation should be yielded back to the Voxa for a response
    };

    _.map([ask, askP, tell, tellP, say, sayP, reprompt, directives, reply],
      (handler: (value: any) => directiveHandler) => this.registerDirectiveHandler(handler, handler.name));
  }

  public async render(templatePath: string, variables?: any): Promise<string|any> {
    return await this.renderer.renderPath(templatePath, this.voxaEvent, variables);
  }

  public addStatement(statement: string): void {
    if (this.isYielding()) {
      throw new Error("Can't append to already yielding response");
    }

    this.response.statements.push(statement);
  }

  public registerDirectiveHandler(handler: (value: any) => directiveHandler, key?: string): void {
    this.directiveHandlers.push({ handler, key });
  }

  get hasMessages(): boolean {
    return this.response.statements.length > 0;
  }

  get hasDirectives(): boolean {
    return this.response.directives.length > 0;
  }

  public clear(): void {
    this.response.reprompt = "";
    this.response.statements = [];
    this.response.directives = [];
  }

  public yield() {
    this.response.yield = true;
    return this;
  }

  public hasDirective(type: string|RegExp): boolean {
    return this.response.directives.some((directive: any) => {
      if (_.isRegExp(type)) { return !!type.exec(directive.type); }
      if (_.isString(type)) { return type === directive.type; }
      if (_.isFunction(type)) { return type(directive); }
      throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
    });
  }

  public isYielding(): boolean {
    return this.response.yield;
  }
}

export function reply(templatePaths: string|string[]): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    if (!_.isArray(templatePaths)) {
      templatePaths = [templatePaths];
    }
    await bluebird.map(templatePaths, async (tp: string): Promise<void> => {
      const message = await response.render(tp);
      if (message.ask) {
        response.addStatement(message.ask);
        response.response.terminate = false;
        response.yield();
      } else if (message.tell) {
        response.addStatement(message.tell);
        response.yield();
      } else if (message.say) {
        response.addStatement(message.say);
        response.response.terminate = false;
      }

      if (message.reprompt) {
        response.response.reprompt = message.reprompt;
      }

      if (message.directives) {
        await bluebird.map(_.filter(message.directives), (fn: directiveHandler) => {
          return fn(response, event);
        });
      }
    });
  };
}

export function ask(templatePath: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await response.render(templatePath);
    return await askP(statement)(response, event);
  };
}

export function askP(statement: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    response.addStatement(statement);
    response.response.terminate = false;
    response.yield();
  };
}

export function tell(templatePath: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await response.render(templatePath);
    return await tellP(statement)(response, event);
  };
}

export function tellP(statement: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    response.addStatement(statement);
    response.yield();
  };
}

export function say(templatePath: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await response.render(templatePath);
    return await sayP(statement)(response, event);
  };
}

export function sayP(statement: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    response.addStatement(statement);
    response.response.terminate = false;
  };
}

export function reprompt(templatePath: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await response.render(templatePath);
    response.response.reprompt = statement;
  };
}

export function directives(functions: directiveHandler[]): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    await bluebird.map(functions, (fn: directiveHandler) => fn(response, event));
  };
}
