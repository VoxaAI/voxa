import { Image, ListItem, Template, TemplateBackButtonVisibility, TemplateType, TextContent, TextField } from "alexa-sdk";

export class DisplayTemplate implements Template {
  public type: TemplateType;
  public listItems: ListItem[];
  public backButton: TemplateBackButtonVisibility;
  public title: string;
  public token: string;
  public textContent: TextContent;
  public backgroundImage?: Image;

  constructor(type: TemplateType) {
    this.type = type;
    this.listItems = [];
    this.backButton = "VISIBLE";
  }

  public setTitle(title: string) {
    this.title = title;
    return this;
  }

  public addItem(token: string, image: string, text1: string, text2?: string, text3?: string): DisplayTemplate {
    const item = {
      image: image ? toImage(image) : undefined,
      textContent: toTextContext(text1, text2, text3),
      token,
    };
    this.listItems.push(item);
    return this;
  }

  public setToken(token: string): DisplayTemplate {
    this.token = token;
    return this;
  }

  public setBackButton(state: TemplateBackButtonVisibility): DisplayTemplate {
    this.backButton = state;
    return this;
  }

  public setTextContent(text1: string, text2?: string, text3?: string): DisplayTemplate {
    this.textContent = toTextContext(text1, text2, text3);
    return this;
  }

  public setBackgroundImage(backgroundImage: string): DisplayTemplate {
    this.backgroundImage = toImage(backgroundImage);
    return this;
  }

  public toJSON() {
    return {
      template: {
        backButton: this.backButton,
        backgroundImage: this.backgroundImage,
        listItems: this.listItems.length > 0 ? this.listItems : undefined,
        textContent: this.textContent,
        title: this.title,
        token: this.token,
        type: this.type,
      },
      type: "Display.RenderTemplate",
    };
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
