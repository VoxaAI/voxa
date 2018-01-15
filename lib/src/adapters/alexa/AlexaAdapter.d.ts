import { ResponseBody } from "alexa-sdk";
import { VoxaApp } from "../../VoxaApp";
import { VoxaAdapter } from "../VoxaAdapter";
import { AlexaEvent } from "./AlexaEvent";
import { AlexaReply } from "./AlexaReply";
export declare class AlexaAdapter extends VoxaAdapter<AlexaReply> {
    static partialReply(event: AlexaEvent, reply: AlexaReply): Promise<null | undefined>;
    static apiRequest(endpoint: string, body: any, authorizationToken: string): any;
    constructor(voxaApp: VoxaApp);
    execute(rawEvent: any, context: any): Promise<ResponseBody>;
}
