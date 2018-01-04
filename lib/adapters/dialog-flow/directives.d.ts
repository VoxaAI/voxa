import { Responses } from "actions-on-google";
import { directiveHandler } from "../../VoxaReply";
export declare function List(templatePath: string | Responses.List): directiveHandler;
export declare function Carousel(templatePath: string | Responses.Carousel): directiveHandler;
export declare function Suggestions(suggestions: string[]): directiveHandler;
export declare function BasicCard(templatePath: string | Responses.BasicCard): directiveHandler;
