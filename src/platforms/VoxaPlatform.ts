
import * as debug from "debug";

import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";
import { IVoxaReply } from "../VoxaReply";
import { createServer } from "./create-server";

const log: debug.IDebugger = debug("voxa");

export abstract class VoxaPlatform {
  public app: VoxaApp;
  public config: any;

  constructor(voxaApp: VoxaApp, config: any= {}) {
    this.app = voxaApp;
    this.config = config;
  }

  public startServer(port: number): void {
    port = port || 3000;
    createServer(this).listen(port, () => {
      debug(`Listening on port ${port}`);
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
}
