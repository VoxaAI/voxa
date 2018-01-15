import { VoxaReply } from "../../VoxaReply";
import { CortanaEvent } from "./CortanaEvent";
export declare class CortanaReply extends VoxaReply {
    voxaEvent: CortanaEvent;
    toJSON(): any;
}
