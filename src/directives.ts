/*
 * Directives are functions that apply changes on the reply object. They can be registered as keys on the voxa
 * application and then used on transitions
 *
 * For example, the reply directive is used as part of the transition to render ask, say, tell, reprompt or directives.
 *
 * return { reply: 'View' }
 */

import * as bluebird from "bluebird";
import * as _ from "lodash";
import { ITransition } from "./StateMachine";
import { IVoxaEvent } from "./VoxaEvent";
import { IVoxaReply } from "./VoxaReply";

export interface IDirectiveClass {
  platform: string; // botframework, dialogFlow or alexa
  key: string; // The key in the transition that links to the specific directive

  new(...args: any[]): IDirective;
}

export interface IDirective {
  writeToReply: (reply: IVoxaReply, event: IVoxaEvent, transition: ITransition) => Promise<void>;
}

export class Reply implements IDirective {
  public static key: string = "reply";
  public static platform: string = "core";

  constructor(public viewPaths: string|string[]) {}

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let viewPaths = this.viewPaths;
    if (!_.isArray(viewPaths)) {
      viewPaths = [viewPaths];
    }

    await bluebird.map(viewPaths, async (viewPath: string): Promise<void> => {
      const message = await event.renderer.renderPath(viewPath, event);
      if (message.say) {
        await new SayP(message.say).writeToReply(reply, event, transition);
      }

      if (message.ask) {
        reply.addStatement(message.ask);
        transition.flow = "yield";
      }

      if (message.tell) {
        reply.addStatement(message.tell);
        reply.terminate();
        transition.flow = "terminate";
      }

      if (message.reprompt) {
        reply.addReprompt(message.reprompt);
      }

      if (message.directives) {
        if (transition.directives) {
          transition.directives = transition.directives.concat(message.directives);
        } else {
          transition.directives = message.directives;
        }
      }
    });
  }
}

export class Reprompt implements IDirective {
  public static key: string = "reprompt";
  public static platform: string = "core";
  public viewPath: string;

  constructor(viewPath: string) {
    this.viewPath = viewPath;
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const statement = await event.renderer.renderPath(this.viewPath, event);
    reply.addReprompt(statement);
  }
}

export class Ask implements IDirective {
  public static key: string = "ask";
  public static platform: string = "core";
  public viewPaths: string[];

  constructor(viewPaths: string|string[]) {
    this.viewPaths = _.isString(viewPaths) ? [viewPaths] : viewPaths;
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    for (const viewPath of this.viewPaths) {
      const statement = await event.renderer.renderPath(viewPath, event);
      if (_.isString(statement)) {
        reply.addStatement(statement);
      } else if (statement.ask) {
        reply.addStatement(statement.ask);
        if (statement.reprompt) {
          reply.addReprompt(statement.reprompt);
        }
      }
    }

    transition.flow = "yield";
    transition.say = this.viewPaths;
  }
}

export class Say implements IDirective {
  public static key: string = "say";
  public static platform: string = "core";

  constructor(public viewPaths: string|string[]) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let viewPaths = this.viewPaths;
    if (_.isString(viewPaths)) {
      viewPaths = [viewPaths];
    }

    await bluebird.mapSeries(viewPaths, async (view: string) => {
      const statement = await event.renderer.renderPath(view, event);
      reply.addStatement(statement);
    });
  }
}

export class SayP implements IDirective {
  public static key: string = "sayp";
  public static platform: string = "core";

  constructor(public statements: string|string[]) { }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    let statements = this.statements;
    if (_.isString(statements)) {
      statements = [statements];
    }

    _.map(statements, (s) => reply.addStatement(s));
  }
}

export class Tell implements IDirective {
  public static key: string = "tell";
  public static platform: string = "core";
  public viewPath: string;

  constructor(viewPath: string) {
    this.viewPath = viewPath;
  }

  public async writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void> {
    const statement = await event.renderer.renderPath(this.viewPath, event);
    reply.addStatement(statement);
    reply.terminate();
    transition.flow = "terminate";
  }
}
