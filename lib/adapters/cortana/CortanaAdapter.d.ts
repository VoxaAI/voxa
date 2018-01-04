import { IBotStorage, IBotStorageData, IMessage } from "botbuilder";
import { ITransition } from "../../StateMachine";
import { VoxaApp } from "../../VoxaApp";
import { IVoxaIntent } from "../../VoxaEvent";
import { VoxaAdapter } from "../VoxaAdapter";
import { CortanaEvent } from "./CortanaEvent";
import { IAuthorizationResponse } from "./CortanaInterfaces";
import { CortanaReply } from "./CortanaReply";
export declare class CortanaAdapter extends VoxaAdapter<CortanaReply> {
    recognizerURI: string;
    storage: IBotStorage;
    applicationId: string;
    applicationPassword: string;
    qAuthorization: PromiseLike<IAuthorizationResponse>;
    constructor(voxaApp: VoxaApp, config: any);
    partialReply(event: CortanaEvent, reply: CortanaReply, transition: ITransition): Promise<null>;
    getAuthorization(): Promise<IAuthorizationResponse>;
    execute(msg: any, context: any): Promise<{}>;
    recognize(msg: IMessage): Promise<IVoxaIntent | undefined>;
    prepIncomingMessage(msg: IMessage): IMessage;
    replyToActivity(event: CortanaEvent, reply: CortanaReply): Promise<any>;
    getStateData(event: IMessage): Promise<IBotStorageData>;
    saveStateData(event: CortanaEvent, reply: CortanaReply): Promise<void>;
    botApiRequest(method: string, uri: string, body: any): Promise<any>;
}
export declare function moveFieldsTo(frm: any, to: any, fields: {
    [id: string]: string;
}): void;
