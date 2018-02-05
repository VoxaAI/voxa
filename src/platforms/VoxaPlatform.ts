
import * as debug from "debug";
import * as _ from "lodash";

import { IDirectiveClass } from "../directives";
import { ITransition } from "../StateMachine";
import { IStateHandler, VoxaApp } from "../VoxaApp";
import { createServer } from "./create-server";

const log: debug.IDebugger = debug("voxa");

export abstract class VoxaPlatform {
  public app: VoxaApp;
  public config: any;
  public platform?: string;

  constructor(voxaApp: VoxaApp, config: any= {}) {
    this.app = voxaApp;
    this.config = config;

    _.forEach(this.getDirectiveHandlers(), (directive) => this.app.directiveHandlers.push(directive));
    _.forEach(this.getPlatformRequests(), (requestType) => voxaApp.registerRequestHandler(requestType));
  }

  public startServer(port: number): void {
    port = port || 3000;
    createServer(this).listen(port, () => {
      log(`Listening on port ${port}`);
    });
  }

  public getDirectiveHandlers(): IDirectiveClass[] {
    return [];
  }

  public getPlatformRequests(): string[] {
    return [];
  }

  public abstract execute(event: any, context?: any): Promise<any>;

  public lambda() {
    return async (event: any, context: any, callback: (err: Error|null, result?: any) => void) => {
      try {
        const result = await this.execute(event, context);
        callback(null, result);
      } catch (error) {
        callback(error);
      }
    };
  }

  public lambdaHTTP() {
    return async (event: any, context: any, callback: (err: Error|null, result?: any) => void) => {
      try {
        const body = JSON.parse(event.body);
        const result = await this.execute(body, context);
        const response = {
          body: JSON.stringify(result),
          headers: {
            "Content-Type" : "application/json",
          },
          statusCode: 200,
        };

        callback(null, response);
      } catch (error) {
        callback(error);
      }
    };
  }

  public azureFunction() {
    return async (context: any, event: any) => {
      try {
        const result = await this.execute(event.body, {});
        context.done(null, result);
      } catch (error) {
        context.done(error);
      }
    };
  }

  public onIntent(intentName: string, handler: IStateHandler|ITransition): void {
    this.app.onIntent(intentName, handler, this.platform);
  }

  public onState(stateName: string, handler: IStateHandler | ITransition, intents: string[] | string = []): void {
    this.app.onState(stateName, handler, intents, this.platform);
  }
}
