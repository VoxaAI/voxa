import { IVoxaEvent } from "../VoxaEvent";
export declare class UnhandledState extends Error {
    event: IVoxaEvent;
    fromState: string;
    transition: any;
    constructor(voxaEvent: IVoxaEvent, transition: any, fromState: string);
}
