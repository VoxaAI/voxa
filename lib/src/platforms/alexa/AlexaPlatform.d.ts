import { ResponseEnvelope } from "ask-sdk-model";
import { VoxaPlatform } from "../VoxaPlatform";
import { AccountLinkingCard, HomeCard, PlayAudio, RenderTemplate } from "./directives";
export declare class AlexaPlatform extends VoxaPlatform {
    platform: string;
    getDirectiveHandlers(): (typeof HomeCard | typeof RenderTemplate | typeof AccountLinkingCard | typeof PlayAudio)[];
    getPlatformRequests(): string[];
    execute(rawEvent: any, context: any): Promise<ResponseEnvelope>;
}
