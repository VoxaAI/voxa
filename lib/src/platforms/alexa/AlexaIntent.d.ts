import * as alexa from "alexa-sdk";
import { IVoxaIntent } from "../../VoxaEvent";
export interface IIntentRequest extends alexa.RequestBody<alexa.IntentRequest> {
    context: any;
}
export declare class AlexaIntent implements IVoxaIntent {
    rawIntent: any;
    name: string;
    params: any;
    constructor(rawIntent: alexa.Intent);
}
