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
import { VoxaPlatform } from "./platforms/VoxaPlatform";
import { ITransition } from "./StateMachine";
import { IVoxaEvent } from "./VoxaEvent";
import { IVoxaReply } from "./VoxaReply";

export interface IDirectiveClass {
  platform: string; // botframework, dialogflow or alexa
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

function sampleOrItem(
  statement: string | string[],
  platform: VoxaPlatform,
): string {
  if (_.isArray(statement)) {
    if (platform.config.test) {
      return _.head(statement) as string;
    }

    return _.sample(statement) as string;
  }

  return statement;
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
    const statement = await event.renderer.renderPath(this.viewPath, event);
    reply.addReprompt(sampleOrItem(statement, event.platform));
  }
}

export interface IAskStatement {
  ask: string;
  reprompt?: string;
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
    transition.flow = "yield";
    transition.say = this.viewPaths;

    for (const viewPath of this.viewPaths) {
      const statement = await event.renderer.renderPath(viewPath, event);
      if (!statement.ask) {
        reply.addStatement(sampleOrItem(statement, event.platform));
      } else {
        this.addStatementToReply(statement, reply, event);
      }
    }
  }

  private addStatementToReply(
    statement: IAskStatement,
    reply: IVoxaReply,
    event: IVoxaEvent,
  ) {
    reply.addStatement(sampleOrItem(statement.ask, event.platform));

    if (statement.reprompt) {
      reply.addReprompt(sampleOrItem(statement.reprompt, event.platform));
    }
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
      const statement = await event.renderer.renderPath(view, event);
      reply.addStatement(sampleOrItem(statement, event.platform));
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
    const statement = await event.renderer.renderPath(this.viewPath, event);
    reply.addStatement(sampleOrItem(statement, event.platform));
    reply.terminate();
    transition.flow = "terminate";
    transition.say = this.viewPath;
  }
}

export class Text implements IDirective {
  public static key: string = "text";
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
      const statement = await event.renderer.renderPath(view, event);
      reply.addStatement(sampleOrItem(statement, event.platform), true);
    });
  }
}

export class TextP implements IDirective {
  public static key: string = "textp";
  public static platform: string = "core";

  constructor(public text: string) {}
  public async writeToReply(
    reply: IVoxaReply,
    event: IVoxaEvent,
    transition: ITransition,
  ): Promise<void> {
    reply.addStatement(this.text, true);
  }
}
