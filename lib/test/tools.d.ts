import { Session } from "alexa-sdk";
import { ILaunchRequest, ISessionEndedRequest } from "../src/platforms/alexa/AlexaEvent";
import { IIntentRequest } from "../src/platforms/alexa/AlexaIntent";
export declare class AlexaRequestBuilder {
    version: string;
    applicationId: string;
    deviceId: string;
    userId: string;
    constructor(userId?: string, applicationId?: string);
    getSessionEndedRequest(reason: string): ISessionEndedRequest;
    getIntentRequest(intentName: string, slots?: any): IIntentRequest;
    getContextData(): {
        AudioPlayer: {
            playerActivity: string;
        };
        System: {
            apiAccessToken: string;
            apiEndpoint: string;
            application: {
                applicationId: string;
            };
            device: {
                deviceId: string;
                supportedInterfaces: {
                    AudioPlayer: {};
                    Display: {};
                };
            };
            user: {
                userId: string;
            };
        };
    };
    getSessionData(): Session;
    getLaunchRequest(): ILaunchRequest;
}
