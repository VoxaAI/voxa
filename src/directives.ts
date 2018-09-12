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

  new (...args: any[]): IDirective;
}

export interface IDirective {
  writeToReply: (
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ) => Promise<void>;
}

export class Reprompt implements IDirective {
  public static key: string = "reprompt";
  public static platform: string = "core";

  constructor(public viewPath: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    let statement = await event.renderer.renderPath(this.viewPath, event);
    if (_.isArray(statement)) {
      statement = _.sample(statement);
    }
    reply.addReprompt(statement);
  }
}

export class Ask implements IDirective {
  public static key: string = "ask";
  public static platform: string = "core";
  public viewPaths: string[];

  constructor(viewPaths: string | string[]) {
    this.viewPaths = _.isString(viewPaths) ? [viewPaths] : viewPaths;
  }

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    for (const viewPath of this.viewPaths) {
      const statement = await event.renderer.renderPath(viewPath, event);
      if (_.isArray(statement)) {
        reply.addStatement(_.sample(statement));
      } else if (_.isString(statement)) {
        reply.addStatement(statement);
      } else if (statement.ask) {
        if (_.isArray(statement.ask)) {
          reply.addStatement(_.sample(statement.ask));
        } else {
          reply.addStatement(statement.ask);
        }

        if (statement.reprompt) {
          if (_.isArray(statement.reprompt)) {
            reply.addReprompt(_.sample(statement.reprompt));
          } else {
            reply.addReprompt(statement.reprompt);
          }
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

  constructor(public viewPaths: string | string[]) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    let viewPaths = this.viewPaths;
    if (_.isString(viewPaths)) {
      viewPaths = [viewPaths];
    }

    await bluebird.mapSeries(viewPaths, async (view: string) => {
      let statement = await event.renderer.renderPath(view, event);
      if (_.isArray(statement)) {
        statement = _.sample(statement);
      }
      reply.addStatement(statement);
    });
  }
}

export class SayP implements IDirective {
  public static key: string = "sayp";
  public static platform: string = "core";

  constructor(public statement: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    reply.addStatement(this.statement);
  }
}

export class Tell implements IDirective {
  public static key: string = "tell";
  public static platform: string = "core";

  constructor(public viewPath: string) {}

  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    let statement = await event.renderer.renderPath(this.viewPath, event);
    if (_.isArray(statement)) {
      statement = _.sample(statement);
    }
    reply.addStatement(statement);
    reply.terminate();
    transition.flow = "terminate";
    transition.say = this.viewPath;
  }
}
