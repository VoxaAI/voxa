import { Context, RequestEnvelope, Session, SessionEndedReason } from "ask-sdk-model";
import { APIGatewayProxyEvent, Callback as AWSLambdaCallback, Context as AWSLambdaContext } from "aws-lambda";
export declare class AlexaRequestBuilder {
    version: string;
    applicationId: string;
    deviceId: string;
    userId: string;
    constructor(userId?: string, applicationId?: string);
    getSessionEndedRequest(reason?: SessionEndedReason): RequestEnvelope;
    getIntentRequest(intentName: string, slots?: any): RequestEnvelope;
    getContextData(): Context;
    getSessionData(): Session;
    getLaunchRequest(): RequestEnvelope;
    getPlaybackStoppedRequest(token?: string): RequestEnvelope;
}
export declare function getLambdaContext(callback: AWSLambdaCallback<any>): AWSLambdaContext;
export declare function getAPIGatewayProxyEvent(method?: string, body?: string | null): APIGatewayProxyEvent;
