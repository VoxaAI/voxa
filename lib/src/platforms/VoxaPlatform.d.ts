import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback as AWSLambdaCallback, Context as AWSLambdaContext } from "aws-lambda";
import { Context as AzureContext, HttpRequest as AzureHttpRequest } from "azure-functions-ts-essentials";
import { IDirectiveClass } from "../directives";
import { ITransition } from "../StateMachine";
import { IStateHandler, VoxaApp } from "../VoxaApp";
export declare abstract class VoxaPlatform {
    app: VoxaApp;
    config: any;
    platform?: string;
    constructor(voxaApp: VoxaApp, config?: any);
    startServer(port: number): void;
    getDirectiveHandlers(): IDirectiveClass[];
    getPlatformRequests(): string[];
    abstract execute(event: any, context?: any): Promise<any>;
    lambda(): (event: any, context: AWSLambdaContext, callback: AWSLambdaCallback<any>) => Promise<void>;
    lambdaHTTP(): (event: APIGatewayProxyEvent, context: AWSLambdaContext, callback: AWSLambdaCallback<APIGatewayProxyResult>) => Promise<void>;
    azureFunction(): (context: AzureContext, req: AzureHttpRequest) => Promise<void>;
    onIntent(intentName: string, handler: IStateHandler | ITransition): void;
    onState(stateName: string, handler: IStateHandler | ITransition, intents?: string[] | string): void;
}
