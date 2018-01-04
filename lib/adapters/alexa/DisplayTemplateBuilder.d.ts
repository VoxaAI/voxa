import { Image, ListItem, Template, TemplateBackButtonVisibility, TemplateType, TextContent } from "alexa-sdk";
export declare class DisplayTemplate implements Template {
    type: TemplateType;
    listItems: ListItem[];
    backButton: TemplateBackButtonVisibility;
    title: string;
    token: string;
    textContent: TextContent;
    backgroundImage?: Image;
    constructor(type: TemplateType);
    setTitle(title: string): this;
    addItem(token: string, image: string, text1: string, text2?: string, text3?: string): DisplayTemplate;
    setToken(token: string): DisplayTemplate;
    setBackButton(state: TemplateBackButtonVisibility): DisplayTemplate;
    setTextContent(text1: string, text2?: string, text3?: string): DisplayTemplate;
    setBackgroundImage(backgroundImage: string): DisplayTemplate;
    toJSON(): {
        template: {
            backButton: TemplateBackButtonVisibility;
            backgroundImage: Image | undefined;
            listItems: ListItem[] | undefined;
            textContent: TextContent;
            title: string;
            token: string;
            type: TemplateType;
        };
        type: string;
    };
}
