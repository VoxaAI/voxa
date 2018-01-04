import { VoxaApp } from "../VoxaApp";
import { VoxaReply } from "../VoxaReply";
declare abstract class VoxaAdapter<Reply extends VoxaReply> {
    app: VoxaApp;
    config: any;
    constructor(voxaApp: VoxaApp, config?: any);
    startServer(port: number): void;
    abstract execute(event: any, context?: any): Promise<any>;
    lambda(): (event: any, context: any, callback: (err: Error | null, result: any) => void) => Promise<void | ((err: Error | null, result: any) => void)>;
}
export { VoxaAdapter };
