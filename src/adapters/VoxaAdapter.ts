
import * as debug from "debug";

import { VoxaApp } from "../VoxaApp";
import { IVoxaEvent } from "../VoxaEvent";
import { VoxaReply } from "../VoxaReply";
import { createServer } from "./create-server";

const log: debug.IDebugger = debug("voxa");

abstract class VoxaAdapter<Reply extends VoxaReply> {
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
    return (event: any, context: any, callback: (err: Error|null, result: any) => void) => this.execute(event, context)
      .then((result) => callback(null, result))
      .catch((error) => callback);
  }
}

export { VoxaAdapter };
