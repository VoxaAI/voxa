import { BasicCardOptions, BrowseCarouselOptions, CarouselOptions, DateTimeOptions, DeepLinkOptions, GoogleActionsV2TransactionDecisionValueSpec, GoogleActionsV2TransactionRequirementsCheckSpec, ListOptions, MediaObject, NewSurfaceOptions, PermissionOptions, RegisterUpdateOptions, TableOptions, UpdatePermissionOptions } from "actions-on-google";
import { IDirective } from "../../directives";
import { ITransition } from "../../StateMachine";
import { IVoxaEvent } from "../../VoxaEvent";
import { IVoxaReply } from "../../VoxaReply";
export declare class List implements IDirective {
    listOptions: string | ListOptions;
    static platform: string;
    static key: string;
    constructor(listOptions: string | ListOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Carousel implements IDirective {
    carouselOptions: string | CarouselOptions;
    static platform: string;
    static key: string;
    constructor(carouselOptions: string | CarouselOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Suggestions implements IDirective {
    suggestions: string | string[];
    static platform: string;
    static key: string;
    constructor(suggestions: string | string[]);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class BasicCard implements IDirective {
    static platform: string;
    static key: string;
    viewPath?: string;
    basicCardOptions?: BasicCardOptions;
    constructor(viewPath: string | BasicCardOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class AccountLinkingCard implements IDirective {
    context?: string | undefined;
    static platform: string;
    static key: string;
    constructor(context?: string | undefined);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class MediaResponse implements IDirective {
    mediaObject: MediaObject;
    static platform: string;
    static key: string;
    constructor(mediaObject: MediaObject);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Permission implements IDirective {
    permissionOptions: PermissionOptions;
    static platform: string;
    static key: string;
    constructor(permissionOptions: PermissionOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class DateTime implements IDirective {
    dateTimeOptions: DateTimeOptions;
    static platform: string;
    static key: string;
    constructor(dateTimeOptions: DateTimeOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Confirmation implements IDirective {
    prompt: string;
    static platform: string;
    static key: string;
    constructor(prompt: string);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class DeepLink implements IDirective {
    deepLinkOptions: DeepLinkOptions;
    static platform: string;
    static key: string;
    constructor(deepLinkOptions: DeepLinkOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export interface IPlaceOptions {
    /**
     * This is the initial response by location sub-dialog.
     * For example: "Where do you want to get picked up?"
     * @public
     */
    prompt: string;
    /**
     * This is the context for seeking permissions.
     * For example: "To find a place to pick you up"
     * Prompt to user: "*To find a place to pick you up*, I just need to check your location.
     *     Can I get that from Google?".
     * @public
     */
    context: string;
}
export declare class Place implements IDirective {
    placeOptions: IPlaceOptions;
    static platform: string;
    static key: string;
    constructor(placeOptions: IPlaceOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class TransactionDecision implements IDirective {
    transactionDecisionOptions: GoogleActionsV2TransactionDecisionValueSpec;
    static platform: string;
    static key: string;
    constructor(transactionDecisionOptions: GoogleActionsV2TransactionDecisionValueSpec);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class TransactionRequirements implements IDirective {
    transactionRequirementsOptions: GoogleActionsV2TransactionRequirementsCheckSpec;
    static platform: string;
    static key: string;
    constructor(transactionRequirementsOptions: GoogleActionsV2TransactionRequirementsCheckSpec);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class RegisterUpdate implements IDirective {
    registerUpdateOptions: RegisterUpdateOptions;
    static platform: string;
    static key: string;
    constructor(registerUpdateOptions: RegisterUpdateOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class UpdatePermission implements IDirective {
    updatePermissionOptions: UpdatePermissionOptions;
    static platform: string;
    static key: string;
    constructor(updatePermissionOptions: UpdatePermissionOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class Table implements IDirective {
    tableOptions: TableOptions;
    static platform: string;
    static key: string;
    constructor(tableOptions: TableOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class BrowseCarousel implements IDirective {
    browseCarouselOptions: BrowseCarouselOptions;
    static platform: string;
    static key: string;
    constructor(browseCarouselOptions: BrowseCarouselOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
export declare class NewSurface implements IDirective {
    newSurfaceOptions: NewSurfaceOptions;
    static platform: string;
    static key: string;
    constructor(newSurfaceOptions: NewSurfaceOptions);
    writeToReply(reply: IVoxaReply, event: IVoxaEvent, transition: ITransition): Promise<void>;
}
