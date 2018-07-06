import { Response, ResponseEnvelope } from "ask-sdk-model";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
export declare class AlexaReply implements IVoxaReply, ResponseEnvelope {
    version: string;
    response: Response;
    sessionAttributes: any;
    readonly hasMessages: boolean;
    readonly hasDirectives: boolean;
    readonly hasTerminated: boolean;
    saveSession(event: IVoxaEvent): Promise<void>;
    terminate(): void;
    readonly speech: string;
    readonly reprompt: string;
    addStatement(statement: string, isPlain?: boolean): void;
    addReprompt(statement: string, isPlain?: boolean): void;
    clear(): void;
    hasDirective(type: string | RegExp): boolean;
}
