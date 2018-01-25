import { Image, ListItem, Template, TemplateBackButtonVisibility, TemplateType, TextContent, TextField } from "alexa-sdk";

export class DisplayTemplate {
  public type: string = "Display.RenderTemplate";
  public template: any;

  constructor(type: TemplateType) {
    this.template = {
      backButton: "VISIBLE",
      type,
    };
  }

  public setTitle(title: string) {
    this.template.title = title;
    return this;
  }

  public addItem(token: string, image: string, text1: string, text2?: string, text3?: string): DisplayTemplate {
    const item = {
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

  public setBackButton(state: TemplateBackButtonVisibility): DisplayTemplate {
    this.template.backButton = state;
    return this;
  }

  public setTextContent(text1: string, text2?: string, text3?: string): DisplayTemplate {
    this.template.textContent = toTextContext(text1, text2, text3);
    return this;
  }

  public setBackgroundImage(backgroundImage: string): DisplayTemplate {
    this.template.backgroundImage = toImage(backgroundImage);
    return this;
  }

}

function toImage(image: string, contentDescription: string = ""): Image {
  return {
    contentDescription,
    sources: [
      {
        url: image,
      },
    ],
  };
}

function toTextContext(text1: string, text2?: string, text3?: string): TextContent {
  const textContent: TextContent = {
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

function toRichText(text: string): TextField {
  return {
    text,
    type: "RichText",
  };
}
