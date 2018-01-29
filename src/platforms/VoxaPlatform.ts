
import * as debug from "debug";

import { ITransition } from "../StateMachine";
import { IStateHandler, VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";
import { createServer } from "./create-server";

const log: debug.IDebugger = debug("voxa");

export abstract class VoxaPlatform {
  public app: VoxaApp;
  public config: any;
  public platform: string;

  constructor(voxaApp: VoxaApp, config: any= {}) {
    this.app = voxaApp;
    this.config = config;
  }

  public startServer(port: number): void {
    port = port || 3000;
    createServer(this).listen(port, () => {
      log(`Listening on port ${port}`);
    });
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

  public onIntent(intentName: string, handler: IStateHandler|ITransition): void {
    this.app.onIntent(intentName, handler, this.platform);
  }

  public onState(stateName: string, handler: IStateHandler | ITransition, intents: string[] | string = []): void {
    this.app.onState(stateName, handler, intents, this.platform);
  }
}
