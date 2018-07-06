import { Intent } from "ask-sdk-model";
import { IVoxaIntent } from "../../VoxaEvent";
export declare class AlexaIntent implements IVoxaIntent {
    rawIntent: any;
    name: string;
    params: any;
    constructor(rawIntent: Intent);
}
