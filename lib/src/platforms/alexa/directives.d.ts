import { Template } from "alexa-sdk";
import { directiveHandler } from "../../directives";
export declare function HomeCard(templatePath: string): directiveHandler;
export declare function DialogDelegate(slots?: any): directiveHandler;
export declare function RenderTemplate(templatePath: string | Template, token: string): directiveHandler;
export declare function AccountLinkingCard(): directiveHandler;
export declare function Hint(templatePath: string): directiveHandler;
export declare function PlayAudio(url: string, token: string, offsetInMilliseconds: number, playBehavior?: string): directiveHandler;
