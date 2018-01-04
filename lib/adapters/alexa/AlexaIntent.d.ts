import * as alexa from "alexa-sdk";
import { IVoxaIntent } from "../../VoxaEvent";
export declare class AlexaIntent implements IVoxaIntent {
    rawIntent: any;
    name: string;
    params: any;
    constructor(rawIntent: alexa.Intent);
}
