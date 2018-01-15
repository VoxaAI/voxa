import { ResponseBody } from "alexa-sdk";
import { ITransition } from "../../StateMachine";
import { VoxaApp } from "../../VoxaApp";
import { VoxaAdapter } from "../VoxaAdapter";
import { AlexaEvent } from "./AlexaEvent";
import { AlexaReply } from "./AlexaReply";
export declare class AlexaAdapter extends VoxaAdapter<AlexaReply> {
    static partialReply(event: AlexaEvent, reply: AlexaReply, transition: ITransition): Promise<ITransition>;
    static apiRequest(endpoint: string, body: any, authorizationToken: string): any;
    constructor(voxaApp: VoxaApp);
    execute(rawEvent: any, context: any): Promise<ResponseBody>;
}
