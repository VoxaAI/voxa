import { interfaces, ui } from "ask-sdk-model";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
export declare class HomeCard implements IDirective {
    viewPath: string | ui.Card;
    static platform: string;
    static key: string;
    constructor(viewPath: string | ui.Card);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Hint implements IDirective {
    viewPath: string;
    static platform: string;
    static key: string;
    constructor(viewPath: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class DialogDelegate implements IDirective {
    slots?: any;
    static platform: string;
    static key: string;
    constructor(slots?: any);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class RenderTemplate implements IDirective {
    static key: string;
    static platform: string;
    viewPath?: string;
    token?: string;
    template?: interfaces.display.RenderTemplateDirective;
    constructor(viewPath: string | interfaces.display.RenderTemplateDirective, token?: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class AccountLinkingCard implements IDirective {
    static key: string;
    static platform: string;
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class PlayAudio implements IDirective {
    url: string;
    token: string;
    offsetInMilliseconds: number;
    behavior: interfaces.audioplayer.PlayBehavior;
    metadata: interfaces.audioplayer.AudioItemMetadata;
    static key: string;
    static platform: string;
    constructor(url: string, token: string, offsetInMilliseconds: number, behavior?: interfaces.audioplayer.PlayBehavior, metadata?: interfaces.audioplayer.AudioItemMetadata);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class StopAudio implements IDirective {
    static key: string;
    static platform: string;
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
