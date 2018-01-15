import { HeroCard as HeroCardType, IAttachment, SuggestedActions as SuggestedActionsType } from "botbuilder";
import { directiveHandler } from "../../directives";
export declare function HeroCard(templatePath: string | HeroCardType): directiveHandler;
export declare function SuggestedActions(templatePath: string | SuggestedActionsType): directiveHandler;
export declare function AudioCard(url: string, title?: string, profile?: string): directiveHandler;
export declare function isAttachment(object: any): object is IAttachment;
export declare function isSuggestedActions(object: any): object is SuggestedActionsType;
