import { AudioCard as AudioCardType, HeroCard as HeroCardType, SuggestedActions as SuggestedActionsType } from "botbuilder";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
export declare class SigninCard implements IDirective {
    url: string;
    cardText: string;
    buttonTitle: string;
    static platform: string;
    static key: string;
    constructor(url: string, cardText?: string, buttonTitle?: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class HeroCard implements IDirective {
    static platform: string;
    static key: string;
    viewPath?: string;
    card?: HeroCardType;
    constructor(viewPath: string | HeroCardType);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class SuggestedActions implements IDirective {
    static key: string;
    static platform: string;
    viewPath?: string;
    suggestedActions?: SuggestedActionsType;
    constructor(viewPath: string | SuggestedActionsType);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class AudioCard implements IDirective {
    profile: string;
    static key: string;
    static platform: string;
    url?: string;
    audioCard?: AudioCardType;
    constructor(url: string | AudioCardType, profile?: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Ask implements IDirective {
    static key: string;
    static platform: string;
    viewPath: string;
    constructor(viewPath: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Say implements IDirective {
    static key: string;
    static platform: string;
    viewPath: string;
    constructor(viewPath: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
