/**
 * Voxa Reply
 *
 * See message-renderer to see the response structure that
 * Reply expects.
 *
 * Copyright (c) 2016 Rain Agency.
 * Licensed under the MIT license.
 */

import * as _ from 'lodash';
import * as debug from 'debug';
import * as striptags from 'striptags';
import * as bluebird from 'bluebird';

import { IVoxaEvent } from './VoxaEvent';
import { IMessage, Renderer } from './renderers/Renderer';

const log: debug.IDebugger = debug('voxa');

export interface IReply<Reply extends VoxaReply> {
  new(event: IVoxaEvent, renderer: Renderer): Reply
}

export interface IDirectiveHandler {
  handler: Function;
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
      statements: [], // Statements will be concatenated together before being sent
      reprompt: '', // Since only one reprompt is possible, only the latest value is kept
      yield: false, // The conversation should be yielded back to the Voxa for a response
      terminate: true, // The conversation is over
      directives: [],
    };

    _.map([ask, askP, tell, tellP, say, sayP, reprompt, directives, reply], (handler) => this.registerDirectiveHandler(handler, handler.name));
  }

  async render(templatePath: string, variables?: any): Promise<string|any> {
    return await this.renderer.renderPath(templatePath, this.voxaEvent, variables);
  }

  addStatement(statement: string): void{
    if (this.isYielding()) {
      throw new Error('Can\'t append to already yielding response');
    }

    this.response.statements.push(statement)
  }

  registerDirectiveHandler(handler: Function, key?: string): void {
    this.directiveHandlers.push({ handler, key })
  }

  get hasMessages(): boolean {
    return this.response.statements.length > 0;
  }

  get hasDirectives(): boolean {
    return this.response.directives.length > 0;
  }

  clear(): void{
    this.response.reprompt = '';
    this.response.statements = [];
    this.response.directives = [];
  }

  yield() {
    this.response.yield = true;
    return this;
  }

  hasDirective(type: string|RegExp): boolean{
    return this.response.directives.some((directive: any) => {
      if (_.isRegExp(type)) return !!type.exec(directive.type);
      if (_.isString(type)) return type === directive.type;
      if (_.isFunction(type)) return type(directive);
      throw new Error(`Do not know how to use a ${typeof type} to find a directive`);
    });
  }

  isYielding() : boolean{
    return this.response.yield;
  }
}

export function reply(templatePaths: string|string[]): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void[]> => {
    if(!_.isArray(templatePaths)) {
      templatePaths = [templatePaths];
    }
    return bluebird.map(templatePaths, async (tp: string): Promise<void> => {
      const message = await reply.render(tp)
      if (message.ask) {
        reply.addStatement(message.ask);
        reply.response.terminate = false;
        reply.yield();
      } else if(message.tell) {
        reply.addStatement(message.tell);
        reply.yield();
      } else if (message.say) {
        reply.addStatement(message.say);
        reply.response.terminate = false;
      }

      if (message.reprompt) {
        reply.response.reprompt = message.reprompt;
      }

      if (message.directives) {
        await bluebird.map(_.filter(message.directives), (fn: Function) => {
          return fn(reply, event)
        });
      }
    });
  }
}

export function ask(templatePath: string): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await reply.render(templatePath)
    return await askP(statement)(reply, event);
  }
}

export function askP(statement: string): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    reply.addStatement(statement);
    reply.response.terminate = false;
    reply.yield();
  }
}

export function tell(templatePath: string): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await reply.render(templatePath)
    return await tellP(statement)(reply, event)
  }
}

export function tellP(statement: string): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    reply.addStatement(statement);
    reply.yield();
  }
}

export function say(templatePath: string): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await reply.render(templatePath)
    return await sayP(statement)(reply, event);
  }
}

export function sayP(statement: string): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    reply.addStatement(statement);
    reply.response.terminate = false;
  }
}

export function reprompt(templatePath: string): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await reply.render(templatePath)
    reply.response.reprompt = statement;
  }
}

export function directives(functions: Function[]): Function {
  return async (reply: VoxaReply, event: IVoxaEvent): Promise<void[]> => {
    return await bluebird.map(functions, fn => fn(reply, event));
  }
}
