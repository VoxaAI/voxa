import { RequestEnvelope } from "ask-sdk-model";
import { IVoxaEvent, IVoxaIntent } from "../../VoxaEvent";
export declare class AlexaEvent extends IVoxaEvent {
    intent: IVoxaIntent;
    requestToIntent: any;
    constructor(event: RequestEnvelope, context?: any);
    readonly user: any;
    readonly token: any;
    readonly supportedInterfaces: string[];
}
