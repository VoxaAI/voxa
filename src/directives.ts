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
import { IVoxaEvent } from "./VoxaEvent";
import { VoxaReply } from "./VoxaReply";

export type directiveHandler = (reply: VoxaReply, event: IVoxaEvent) => Promise<void>;

export function reply(templatePaths: string|string[]): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    if (!_.isArray(templatePaths)) {
      templatePaths = [templatePaths];
    }

    await bluebird.map(templatePaths, async (tp: string): Promise<void> => {
      const message = await response.render(tp);
      if (message.say) {
        await sayP(message.say)(response, event);
      }

      if (message.ask) {
        await askP(message.ask)(response, event);
      }

      if (message.tell) {
        await tellP(message.tell)(response, event);
      }

      if (message.reprompt) {
        await repromptP(message.reprompt)(response, event);
      }

      if (message.directives) {
        await directives(message.directives)(response, event);
      }
    });
  };
}

/*
 * Takes a template path and renders it, then adds it to the reply as an ask statement
 */
export function ask(templatePath: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    const statement: string = await response.render(templatePath);
    return await askP(statement)(response, event);
  };
}

/*
 * Plain version of ask, takes an statement and adds it directly to the reply without
 * rendering it first
 */
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
    response.response.terminate = true;
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
    return await repromptP(statement)(response, event);
  };
}

export function repromptP(statement: string): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    response.response.reprompt = statement;
  };
}

export function directives(functions: directiveHandler[]): directiveHandler {
  return async (response: VoxaReply, event: IVoxaEvent): Promise<void> => {
    if (functions && functions.length) {
      await bluebird.map(functions, (fn: directiveHandler) => fn(response, event));
    }
  };
}
