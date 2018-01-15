import { IVoxaIntent } from "../../VoxaEvent";
export declare class DialogFlowIntent implements IVoxaIntent {
    name: string;
    rawIntent: any;
    params: any;
    constructor(rawEvent: any);
    getParams(): any;
}
