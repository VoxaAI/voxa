import { interfaces } from "ask-sdk-model";
import * as _ from "lodash";

export type TitleTemplateType = (
  interfaces.display.BodyTemplate1 |
  interfaces.display.BodyTemplate2 |
  interfaces.display.BodyTemplate3 |
  interfaces.display.BodyTemplate7 |
  interfaces.display.ListTemplate1 |
  interfaces.display.ListTemplate2
);

export type ListTemplateType = (
  interfaces.display.ListTemplate1 |
  interfaces.display.ListTemplate2
);

export class DisplayTemplate implements interfaces.display.RenderTemplateDirective {
  public type!: "Display.RenderTemplate";
  public template!: interfaces.display.Template;

  constructor(type: any) {
    this.type = "Display.RenderTemplate";
    this.template = {
      type,
    };
  }

  public setTitle(title: string) {
    if (!isTitleTemplate(this.template)) {
      throw new Error("This template does not support a title");
    }

    this.template.title = title;
    return this;
  }

  public addItem(token: string, image: string, text1: string, text2?: string, text3?: string): DisplayTemplate {
    if (!isListTemplate(this.template)) {
      throw new Error("This template does not support a list items");
    }

    const item: interfaces.display.ListItem = {
      image: image ? toImage(image) : undefined,
      textContent: toTextContext(text1, text2, text3),
      token,
    };

    this.template.listItems = this.template.listItems || [];
    this.template.listItems.push(item);
    return this;
  }

  public setToken(token: string): DisplayTemplate {
    this.template.token = token;
    return this;
  }

  public setBackButton(state: interfaces.display.BackButtonBehavior): DisplayTemplate {
    this.template.backButton = state;
    return this;
  }

  public setTextContent(text1: string, text2?: string, text3?: string): DisplayTemplate {
    (this.template as any).textContent = toTextContext(text1, text2, text3);
    return this;
  }

  public setBackgroundImage(backgroundImage: string, contentDescription: string = ""): DisplayTemplate {
    this.template.backgroundImage = toImage(backgroundImage, contentDescription);
    return this;
  }

}

function toImage(image: string, contentDescription: string = ""): interfaces.display.Image {
  return {
    contentDescription,
    sources: [
      {
        url: image,
      },
    ],
  };
}

function toTextContext(text1: string, text2?: string, text3?: string): interfaces.display.TextContent {
  const textContent: interfaces.display.TextContent = {
    primaryText: toRichText(text1),
  };

  if (text2) {
    textContent.secondaryText = toRichText(text2);
  }

  if (text3) {
    textContent.tertiaryText = toRichText(text3);
  }

  return textContent;
}

function toRichText(text: string): interfaces.display.TextField {
  return {
    text,
    type: "RichText",
  };
}

function isTitleTemplate(template: any): template is TitleTemplateType  {
  return _.includes([
    "BodyTemplate1",
    "BodyTemplate2",
    "BodyTemplate3",
    "BodyTemplate7",
    "ListTemplate1",
    "ListTemplate2",
  ], template.type);
}

function isListTemplate(template: any): template is ListTemplateType {
  return _.includes([
    "ListTemplate1",
    "ListTemplate2",
  ], template.type);
}
