import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback as AWSLambdaCallback, Context as AWSLambdaContext } from "aws-lambda";
import { IBotStorage, IBotStorageData, IMessage } from "botbuilder";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaIntent } from "../../VoxaEvent";
import { VoxaPlatform } from "../VoxaPlatform";
import { Ask, AudioCard, HeroCard, SigninCard, SuggestedActions } from "./directives";
export declare class BotFrameworkPlatform extends VoxaPlatform {
    recognizerURI: string;
    storage: IBotStorage;
    applicationId: string;
    applicationPassword: string;
    constructor(voxaApp: VoxaApp, config: any);
    lambdaHTTP(): (event: APIGatewayProxyEvent, context: AWSLambdaContext, callback: AWSLambdaCallback<APIGatewayProxyResult>) => Promise<void>;
    getDirectiveHandlers(): (typeof SigninCard | typeof HeroCard | typeof SuggestedActions | typeof AudioCard | typeof Ask)[];
    getPlatformRequests(): string[];
    execute(msg: any, context: any): Promise<{}>;
    recognize(msg: IMessage): Promise<IVoxaIntent | undefined>;
    getStateData(event: IMessage): Promise<IBotStorageData>;
}
export declare function moveFieldsTo(frm: any, to: any, fields: {
    [id: string]: string;
}): void;
export declare function prepIncomingMessage(msg: IMessage): IMessage;
