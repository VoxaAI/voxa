import { interfaces } from "ask-sdk-model";
export declare type TitleTemplateType = (interfaces.display.BodyTemplate1 | interfaces.display.BodyTemplate2 | interfaces.display.BodyTemplate3 | interfaces.display.BodyTemplate7 | interfaces.display.ListTemplate1 | interfaces.display.ListTemplate2);
export declare type ListTemplateType = (interfaces.display.ListTemplate1 | interfaces.display.ListTemplate2);
export declare class DisplayTemplate implements interfaces.display.RenderTemplateDirective {
    type: "Display.RenderTemplate";
    template: interfaces.display.Template;
    constructor(type: any);
    setTitle(title: string): this;
    addItem(token: string, image: string, text1: string, text2?: string, text3?: string): DisplayTemplate;
    setToken(token: string): DisplayTemplate;
    setBackButton(state: interfaces.display.BackButtonBehavior): DisplayTemplate;
    setTextContent(text1: string, text2?: string, text3?: string): DisplayTemplate;
    setBackgroundImage(backgroundImage: string, contentDescription?: string): DisplayTemplate;
}
