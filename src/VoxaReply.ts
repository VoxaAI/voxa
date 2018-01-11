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
  public renderer: Renderer;

  constructor(voxaEvent: IVoxaEvent, renderer: Renderer) {
    this.voxaEvent = voxaEvent;
    this.session = voxaEvent.session;
    this.renderer = renderer;

    this.response = {
      directives: [],
      reprompt: "", // Since only one reprompt is possible, only the latest value is kept
      statements: [], // Statements will be concatenated together before being sent
      terminate: true, // The conversation is over
      yield: false, // The conversation should be yielded back to the Voxa for a response
    };

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

  public hasDirective(type: string|RegExp|((x: any) => boolean)): boolean {
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
