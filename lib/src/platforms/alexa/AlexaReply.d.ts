import { OutputSpeech, ResponseBody } from "alexa-sdk";
import { VoxaReply } from "../../VoxaReply";
export declare class AlexaReply extends VoxaReply {
    static createSpeechObject(speech: string | undefined): OutputSpeech;
    readonly supportsDisplayInterface: boolean;
    toJSON(): ResponseBody;
}
